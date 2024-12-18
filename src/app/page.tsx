'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'

interface SearchResult {
  name: string
  seq: string
  exactMatch?: boolean
}

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!keyword.trim()) {
      toast({
        title: '请输入关键词',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setSearchResults([])
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`)
      const data = await response.json()
      
      if (data.error) {
        toast({
          title: '搜索失败',
          description: data.error,
          variant: 'destructive',
        })
        return
      }

      if (data.result && data.result.length > 0) {
        setSearchResults(data.result)
        if (!data.exactMatch) {
          toast({
            title: '提示',
            description: '未找到完全匹配的播客，显示相关结果',
          })
        }
      } else {
        toast({
          title: '未找到相关播客',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: '搜索失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (rssLink: string) => {
    try {
      await navigator.clipboard.writeText(rssLink)
      toast({
        title: '复制成功',
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '请手动复制',
        variant: 'destructive',
      })
    }
  }

  const getRssLink = (seq: string) => `https://podwise.ai/feed/podcasts/${seq}/rss.xml`

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">播客 RSS 搜索</h1>
          <p className="mt-2 text-sm text-gray-600">输入播客名称获取 RSS 订阅链接</p>
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="输入播客名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? '搜索中...' : '搜索'}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={result.seq} className="p-4 bg-white border rounded-lg space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{result.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">RSS 链接：</p>
                    <p className="text-sm break-all text-gray-900 bg-gray-50 p-3 rounded mt-2">
                      {getRssLink(result.seq)}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => copyToClipboard(getRssLink(result.seq))} 
                  className="w-full"
                >
                  复制链接
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
