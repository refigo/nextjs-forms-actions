export default function NotFound() {
  return (
    <div className="container mx-auto py-10 text-center">
      <h1 className="text-3xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h1>
      <p className="mb-4">요청하신 페이지가 존재하지 않습니다.</p>
      <a href="/" className="text-blue-500 hover:underline">홈으로 돌아가기</a>
    </div>
  );
}
