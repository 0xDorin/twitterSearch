"use client";

import { useState, useMemo } from "react";

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

export default function TweetsPage() {
  const [keyword, setKeyword] = useState("mantle");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 필터 상태
  const [minLikes, setMinLikes] = useState(0);
  const [minRetweets, setMinRetweets] = useState(0);
  const [minReplies, setMinReplies] = useState(0);

  const searchTweets = async () => {
    if (!keyword.trim()) {
      setError("키워드를 입력하세요");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 필터 조건을 쿼리에 포함
      const params = new URLSearchParams({
        keyword: keyword,
        min_likes: minLikes.toString(),
        min_retweets: minRetweets.toString(),
        min_replies: minReplies.toString(),
      });

      const response = await fetch(`/api/tweets/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.message ||
          errorData.error ||
          "트윗을 가져오는데 실패했습니다";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setTweets(data.tweets || []);
      setSearchQuery(data.query || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "에러 발생");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-8 max-w-5xl">
        {/* 헤더 */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">트윗 검색</h1>
          <p className="text-lg text-gray-600">
            키워드를 입력하면 텍스트, @멘션, #해시태그를 모두 검색합니다
          </p>
        </div>

        {/* 검색 입력 */}
        <div className="mb-8 p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              검색 키워드
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색할 키워드 (예: mantle)"
              className="w-full px-5 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black placeholder:text-black"
              onKeyPress={(e) => e.key === "Enter" && searchTweets()}
            />
          </div>

          {/* 필터 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              필터 조건 (선택사항)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 좋아요 ❤️
                </label>
                <input
                  type="number"
                  min="0"
                  value={minLikes}
                  onChange={(e) => setMinLikes(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black placeholder:text-black"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 리트윗 🔄
                </label>
                <input
                  type="number"
                  min="0"
                  value={minRetweets}
                  onChange={(e) => setMinRetweets(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black placeholder:text-black"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 댓글 💬
                </label>
                <input
                  type="number"
                  min="0"
                  value={minReplies}
                  onChange={(e) => setMinReplies(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-black placeholder:text-black"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <button
            onClick={searchTweets}
            disabled={loading}
            className="w-full px-8 py-3 text-lg font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-sm"
          >
            {loading ? "검색 중..." : "검색"}
          </button>
        </div>

        {/* 검색 쿼리 표시 */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="font-semibold text-gray-900">검색 쿼리:</span>{" "}
            <code className="text-blue-700 font-mono text-sm">
              {searchQuery}
            </code>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* 결과 카운트 */}
        {tweets.length > 0 && (
          <div className="mb-6 text-gray-700 font-medium text-lg">
            <span className="text-blue-600 font-bold">{tweets.length}</span>개의
            트윗을 찾았습니다
          </div>
        )}

        {/* 결과 표시 */}
        <div className="space-y-5">
          {tweets.length === 0 && !loading && !error && (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">
                검색 버튼을 눌러 트윗을 검색하세요
              </p>
            </div>
          )}

          {tweets.map((tweet) => (
            <div
              key={tweet.id}
              className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition"
            >
              <p className="text-gray-900 text-lg mb-4 leading-relaxed whitespace-pre-wrap">
                {tweet.text}
              </p>
              <div className="flex items-center gap-6 text-gray-600 text-sm mb-3">
                <span className="flex items-center gap-1">
                  <span className="text-red-500">❤️</span>
                  <span className="font-medium">
                    {tweet.public_metrics?.like_count || 0}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-500">🔄</span>
                  <span className="font-medium">
                    {tweet.public_metrics?.retweet_count || 0}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-blue-500">💬</span>
                  <span className="font-medium">
                    {tweet.public_metrics?.reply_count || 0}
                  </span>
                </span>
                <span className="ml-auto text-gray-500">
                  {new Date(tweet.created_at).toLocaleString("ko-KR")}
                </span>
              </div>
              <a
                href={`https://x.com/i/web/status/${tweet.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
              >
                트윗 보기
                <span className="ml-1">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
