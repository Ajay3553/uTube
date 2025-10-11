import { useState } from 'react'

export const usePagination = (initialPage = 1, initialLimit = 20) => {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const nextPage = () => setPage(page + 1)
  const prevPage = () => setPage(page > 1 ? page - 1 : 1)
  const goToPage = (pageNumber) => setPage(pageNumber)
  const resetPage = () => setPage(1)

  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    setLimit
  }
}

export default usePagination
