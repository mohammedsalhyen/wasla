import type { ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit'
import type { Rec } from '../api/client'

export interface Res<T = Rec> { data?: T; status: 'idle' | 'loading' | 'succeeded' | 'failed'; error?: string }
export const idle = <T = Rec>(): Res<T> => ({ status: 'idle' })

/** Wires a thunk's pending/fulfilled/rejected into state[key] as a Res. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const addRes = <S extends Record<string, any>>(b: ActionReducerMapBuilder<S>, thunk: AsyncThunk<any, any, any>, key: keyof S) => {
    b.addCase(thunk.pending, (s) => {
        const draft = s as Record<PropertyKey, any>
        const current = draft[key] as Res | undefined

        if (current) {
            current.status = 'loading'
        } else {
            draft[key] = { status: 'loading' } as S[keyof S]
        }
    })
    b.addCase(thunk.fulfilled, (s, a) => { ;(s as Record<PropertyKey, any>)[key] = { data: a.payload, status: 'succeeded' } as S[keyof S] })
    b.addCase(thunk.rejected, (s, a) => { ;(s as Record<PropertyKey, any>)[key] = { status: 'failed', error: a.payload as string } as S[keyof S] })
}
