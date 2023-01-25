import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { userLoggedOut } from "../../features/auth/authSlice";

export default function Navigation() {
    const dispatch = useDispatch();

    const logout = () => {
        dispatch(userLoggedOut());
        localStorage.clear();
    };
    return (
        <nav className="border-general sticky top-0 z-40 border-b bg-violet-700 transition-colors">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/">
                        <Link to="/">
                            <h1 className="text-3xl font-bold text-white text-center"><i class="fa-brands fa-rocketchat"></i> Chat</h1>
                        </Link>
                    </Link>
                    <ul>
                        <li className="text-white">
                            <span className="cursor-pointer" onClick={logout}>
                                Logout
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
