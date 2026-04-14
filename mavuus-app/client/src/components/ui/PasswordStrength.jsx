export default function PasswordStrength({ password }) {
  if (!password) return null

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains a number', met: /[0-9]/.test(password) },
  ]

  const metCount = checks.filter(c => c.met).length
  const strength = metCount === 3 ? 'strong' : metCount >= 2 ? 'medium' : 'weak'
  const colors = { weak: 'bg-red-400', medium: 'bg-yellow-400', strong: 'bg-green-400' }
  const labels = { weak: 'Weak', medium: 'Medium', strong: 'Strong' }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i < metCount ? colors[strength] : 'bg-neutral-200'}`} />
          ))}
        </div>
        <span className={`text-xs font-medium ${strength === 'strong' ? 'text-green-600' : strength === 'medium' ? 'text-yellow-600' : 'text-red-500'}`}>
          {labels[strength]}
        </span>
      </div>
      <ul className="space-y-0.5">
        {checks.map((check, i) => (
          <li key={i} className={`text-xs flex items-center gap-1.5 ${check.met ? 'text-green-600' : 'text-neutral-400'}`}>
            <span className={`w-1 h-1 rounded-full ${check.met ? 'bg-green-500' : 'bg-neutral-300'}`} />
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
