// OrderStatus numbers come from the backend brief; every other enum is read at runtime from GET /api/lookups/enums.
export const OrderStatus = {
    AwaitingPayment: 1, PaymentSubmitted: 2, PaymentRejected: 3, Placed: 4, Confirmed: 5,
    Preparing: 6, OutForDelivery: 7, Delivered: 8, Cancelled: 9, Expired: 10,
} as const

export const orderStatusStrip = [4, 5, 6, 7, 8] // happy path shown in the timeline

export type EnumOption = { name: string; value: number }
export type EnumMap = Record<string, EnumOption[]>

/** The response shape of /api/lookups/enums is not documented: accept {Enum:[{name,value}]} or {Enum:{Name:value}}. */
export const normalizeEnums = (raw: unknown): EnumMap => {
    const out: EnumMap = {}
    if (!raw || typeof raw !== 'object') return out
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        if (Array.isArray(v)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            out[k] = v.map((x: any) => ({ name: String(x.name ?? x.Name ?? x.key ?? x.label), value: Number(x.value ?? x.Value ?? x.id) }))
        } else if (v && typeof v === 'object') {
            out[k] = Object.entries(v as Record<string, unknown>).map(([name, value]) => ({ name, value: Number(value) }))
        }
    }
    return out
}

/** Case-insensitive lookup so a guessed enum type name still resolves. */
export const enumOf = (m: EnumMap | undefined, type: string): EnumOption[] =>
    (m && (m[type] ?? m[Object.keys(m).find((k) => k.toLowerCase() === type.toLowerCase()) ?? ''])) || []
