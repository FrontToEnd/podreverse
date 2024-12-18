import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://podwise.ai/api/search/podcasts?q=${encodeURIComponent(query)}&page=0&hitsPerPage=20`
    )
    const data = await response.json()

    if (!data.result || data.result.length === 0) {
      return NextResponse.json({ error: 'No results found' }, { status: 404 })
    }

    // 查找精确匹配的播客
    const exactMatch = data.result.find(
      (podcast: any) => podcast.name.toLowerCase() === query.toLowerCase()
    )

    // 如果找到精确匹配，返回该播客
    if (exactMatch) {
      return NextResponse.json({ 
        result: [exactMatch],
        exactMatch: true 
      })
    }

    // 如果没有精确匹配，返回所有结果和提示
    return NextResponse.json({ 
      result: data.result,
      exactMatch: false
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
