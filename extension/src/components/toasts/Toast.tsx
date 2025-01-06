import classNames from 'classnames'
import { X } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { PropsWithChildren, ReactNode } from 'react'
import {
  toast as baseToast,
  Slide,
  type ToastOptions as BaseToastOptions,
  type ToastContent,
  type ToastContentProps,
} from 'react-toastify'

type ToastData = { message: ReactNode; title: string }

export type DerivedToastProps = ToastContentProps<ToastData>

export const Toast = ({
  children,
  className,
}: PropsWithChildren<{ className: string }>) => (
  <div
    className={classNames(
      'flex max-w-full flex-col gap-1 rounded-md border text-sm shadow-lg',
      className,
    )}
  >
    {children}
  </div>
)

type ToastOptions = Omit<
  BaseToastOptions,
  'toastId' | 'closeButton' | 'hideProgressBar' | 'transition' | 'className'
> & { data: ToastData }

export const toast = (
  ToastComponent: ToastContent<ToastData>,
  options: ToastOptions,
) => {
  const id = nanoid()

  const dismiss = () => baseToast.dismiss(id)

  baseToast(ToastComponent, {
    toastId: id,
    closeButton: false,
    hideProgressBar: true,
    transition: Slide,
    className: `p-0 mx-4 mb-4 w-auto first:mt-4`,

    ...options,
  })

  return { dismiss }
}

const Header = ({ children }: PropsWithChildren) => (
  <div className="flex items-center justify-between gap-4 px-2 pt-2">
    {children}
  </div>
)

Toast.Header = Header

const Title = ({
  children,
  className,
}: PropsWithChildren<{ className: string }>) => (
  <h2 className={classNames('font-semibold', className)}>{children}</h2>
)

Toast.Title = Title

const Message = ({
  className,
  children,
}: PropsWithChildren<{ className: string }>) => (
  <div className={classNames('max-h-40 overflow-y-auto px-2 pb-2', className)}>
    {children}
  </div>
)

Toast.Message = Message

const Dismiss = ({
  children,
  className,
  onDismiss,
}: PropsWithChildren<{ className: string; onDismiss: () => void }>) => (
  <button
    onClick={onDismiss}
    className={classNames('rounded-md p-1 transition-all', className)}
  >
    <X size={16} />

    <span className="sr-only">{children}</span>
  </button>
)

Toast.Dismiss = Dismiss
