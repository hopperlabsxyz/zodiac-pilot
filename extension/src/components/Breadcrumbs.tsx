import { Children, ComponentProps, PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'

export const Breadcrumbs = ({ children }: PropsWithChildren) => (
  <div className="flex items-center gap-2 font-mono text-xs uppercase opacity-75">
    {Children.map(children, (child) => (
      <>/{child}</>
    ))}
  </div>
)

const Entry = (props: Omit<ComponentProps<typeof Link>, 'className'>) => (
  <Link {...props} className="no-underline" />
)

Breadcrumbs.Entry = Entry
