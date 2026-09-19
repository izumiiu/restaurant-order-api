

declare global{
    namespace Express{
        interface Request{
            user?:{
                userId: string,
                username: string,
                role: 'customer' | 'employee'
            }
        }
    }
}

export {}