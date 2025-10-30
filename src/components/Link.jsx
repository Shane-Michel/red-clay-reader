import { useNavigation } from '../navigation'

export default function Link({ to, state, children, className, onNavigate, ...rest }) {
  const { navigate } = useNavigation()

  const handleClick = (event) => {
    if (rest.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    navigate(to, { state })
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
