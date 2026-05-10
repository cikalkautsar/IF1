import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function createFallbackBuilder() {
	const builder = {
		select() {
			return builder
		},
		insert() {
			return Promise.resolve({ data: null, error: null })
		},
		delete() {
			return builder
		},
		eq() {
			return builder
		},
		order() {
			return Promise.resolve({ data: [], error: null })
		},
		upload() {
			return Promise.resolve({ data: null, error: { message: 'Supabase env belum diset di deployment.' } })
		},
		getPublicUrl() {
			return { data: { publicUrl: '' } }
		},
		then(resolve) {
			return Promise.resolve({ data: [], error: null }).then(resolve)
		},
	}

	return builder
}

function createFallbackSupabase() {
	return {
		from() {
			return createFallbackBuilder()
		},
		storage: {
			from() {
				return createFallbackBuilder()
			},
		},
	}
}

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : createFallbackSupabase()