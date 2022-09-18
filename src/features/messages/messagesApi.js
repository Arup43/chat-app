import { apiSlice } from "../api/apiSlice";
import { io } from "socket.io-client";

export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                // create socket
                const socket = io("https://chat-app-assignment-9.herokuapp.com", {
                    reconnectionDelay: 1000,
                    reconnection: true,
                    reconnectionAttemps: 10,
                    transports: ["websocket"],
                    agent: false,
                    upgrade: false,
                    rejectUnauthorized: false,
                });

                try {
                    await cacheDataLoaded;
                    socket.on("message", (data) => {
                        
                        updateCachedData((draft) => {
                            if (draft.data[0].conversationId == data?.data?.conversationId) {
                                draft.data.unshift(data?.data);
                            }
                        });
                    });
                } catch (err) { }

                await cacheEntryRemoved;
                socket.close();
            },
            transformResponse(apiResponse, meta) {
                const totalCount = meta.response.headers.get("X-Total-Count");
                return {
                    data: apiResponse,
                    totalCount,
                };
            }
        }),
        getMoreMessages: builder.query({
            query: ({id, page}) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,
            async onQueryStarted({id, page}, {queryFulfilled, dispatch}) {
                try {
                    const messages = await queryFulfilled;
                    if (messages?.data?.length > 0) {
                        dispatch(apiSlice.util.updateQueryData("getMessages", id.toString(), (draft) => {
                            let fromDraft = draft.data.filter(m => {
                                if(messages.data.find(m2 => m2.id == m.id)) {
                                    return false;
                                }
                                return true;
                            })
                            return { 
                                data: [...fromDraft, ...messages.data],
                                totalCount: Number(draft.totalCount)
                            };
                        }));
                    }
                } catch (err) { }
            }
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: "/messages",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;
