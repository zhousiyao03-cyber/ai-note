'use client'

import NextLink from 'next/link'
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation'
import { forwardRef, useEffect, useMemo } from 'react'

type NextLinkComponentProps = React.ComponentProps<typeof NextLink>

type CompatLinkProps = Omit<NextLinkComponentProps, 'href'> & {
  to: NextLinkComponentProps['href']
}

export const LinkCompat = forwardRef<HTMLAnchorElement, CompatLinkProps>(function LinkCompat(
  { to, ...props },
  ref,
) {
  return <NextLink ref={ref} href={to} {...props} />
})

export { LinkCompat as Link }

export function useLocation() {
  const pathname = usePathname()

  return useMemo(
    () => ({
      pathname,
    }),
    [pathname],
  )
}

export function useNavigate() {
  const router = useRouter()

  return (href: string) => {
    router.push(href)
  }
}

export function useParams<T extends Record<string, string | string[] | undefined>>() {
  return useNextParams<T>()
}

interface NavigateProps {
  to: string
  replace?: boolean
}

export function Navigate({ to, replace = false }: NavigateProps) {
  const router = useRouter()

  useEffect(() => {
    if (replace) {
      router.replace(to)
      return
    }

    router.push(to)
  }, [replace, router, to])

  return null
}
