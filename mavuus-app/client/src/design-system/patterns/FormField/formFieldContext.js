import { createContext } from 'react'

// Lets a control inside FormField know a visible <label for> already names it, so it can skip
// its own fallback name during render. { controlId, labelled }.
export const FormFieldContext = createContext(null)
