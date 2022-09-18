import { useSelector } from "react-redux";
import Message from "./Message";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { messagesApi } from "../../../features/messages/messagesApi";

export default function Messages({ messages = [], totalCount }) {
    const { user } = useSelector((state) => state.auth) || {};
    const { email } = user || {};
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const dispatch = useDispatch();


    const id = messages[0]?.conversationId;

    const fetchMore = () => {
        setPage((prevPage) => prevPage + 1);
    }

    useEffect(() => {
        if (page > 1) {
            dispatch(
                messagesApi.endpoints.getMoreMessages.initiate({
                    id,
                    page,
                })
            );
        }
    },[page, dispatch, id]);

    useEffect(() => {
        if(totalCount>0){
            const more = Math.ceil(totalCount/Number(process.env.REACT_APP_MESSAGES_PER_PAGE)) > page;

            setHasMore(more);
        }
    }, [totalCount, page]);

    return (
        <div id="scrollableDiv" className="relative w-full h-[calc(100vh_-_197px)] p-6 overflow-y-auto flex flex-col-reverse">
            <ul className="space-y-2">
                <InfiniteScroll
                    dataLength={messages.length}
                    next={fetchMore}
                    hasMore={hasMore}
                    style={{ display: 'flex', flexDirection: 'column-reverse' }} 
                    inverse={true}
                    loader={<h3>Loading...</h3>}
                    scrollableTarget="scrollableDiv"
                >
                    {messages
                        .slice()
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((message) => {
                            const {
                                message: lastMessage,
                                id,
                                sender,
                            } = message || {};

                            const justify =
                                sender.email !== email ? "start" : "end";

                            return (
                                <Message
                                    key={id}
                                    justify={justify}
                                    message={lastMessage}
                                />
                            );
                        })}
                </InfiniteScroll>
            </ul>
        </div>
    );
}
