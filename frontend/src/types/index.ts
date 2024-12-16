export type User = {
    handle: string
    name: string
    email: string
}

export type RegisterForm = Pick<User, 'handle' | 'name' | 'email'> & {
    password: string
    password_confirmation: string
}