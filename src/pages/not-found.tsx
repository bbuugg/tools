import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <p className="text-muted-foreground">页面不存在</p>
            <Link to="/" className="text-primary hover:underline">返回首页</Link>
        </div>
    )
}