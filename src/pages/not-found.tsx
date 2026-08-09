import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900">404</h1>
            <p className="text-gray-500">页面不存在</p>
            <Link to="/" className="text-primary hover:underline">返回首页</Link>
        </div>
    )
}