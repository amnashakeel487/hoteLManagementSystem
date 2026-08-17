import useReveal from '../hooks/useReveal';

/** <Reveal as="div" className="extra-class">...</Reveal> */
export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const { ref, className: revealClass } = useReveal();
  return (
    <Tag ref={ref} className={`${revealClass} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
