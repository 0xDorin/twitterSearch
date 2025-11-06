import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 로그인 확인
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // URL에서 키워드 파라미터 가져오기
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "mantle";
  const maxResults = searchParams.get("max_results") || "50";

  try {
    // 검색 쿼리 구성: 키워드 OR @멘션 OR #해시태그
    const searchQuery = `(${keyword} OR @${keyword} OR #${keyword}) -scam -giveaway`;
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
