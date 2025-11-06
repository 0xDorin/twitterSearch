import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 로그인 확인
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // URL에서 파라미터 가져오기
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "mantle";
  const minLikes = searchParams.get("min_likes") || "0";
  const minRetweets = searchParams.get("min_retweets") || "0";
  const minReplies = searchParams.get("min_replies") || "0";
  const maxResults = "10"; // 10개로 고정

  try {
    // 검색 쿼리 구성: 키워드 OR @멘션 OR #해시태그 + 필터
    let searchQuery = `(${keyword} OR @${keyword} OR #${keyword}) -scam -giveaway`;

    // Twitter API 필터 추가
    if (parseInt(minLikes) > 0) {
      searchQuery += ` min_faves:${minLikes}`;
    }
    if (parseInt(minRetweets) > 0) {
      searchQuery += ` min_retweets:${minRetweets}`;
    }
    if (parseInt(minReplies) > 0) {
      searchQuery += ` min_replies:${minReplies}`;
    }

    const query = encodeURIComponent(searchQuery);

    // Twitter API v2 - Recent Search (최근 7일)
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=${maxResults}&tweet.fields=created_at,author_id,text,public_metrics`;

    // Bearer Token 사용 (App-only auth)
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();

      // Rate limit 정보 추출
      const rateLimitRemaining = response.headers.get("x-rate-limit-remaining");
      const rateLimitReset = response.headers.get("x-rate-limit-reset");

      if (response.status === 429) {
        const resetTime = rateLimitReset
          ? new Date(parseInt(rateLimitReset) * 1000).toLocaleString("ko-KR")
          : "알 수 없음";

        return NextResponse.json(
          {
            error: "API 사용량 초과",
            message: `너무 많은 요청을 보냈습니다. ${resetTime}에 다시 시도하세요.`,
            details: error,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Twitter API error", details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      tweets: data.data || [],
      meta: data.meta || {},
      query: searchQuery,
    });
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tweets" },
      { status: 500 }
    );
  }
}
