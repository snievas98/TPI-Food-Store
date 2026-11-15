import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUsuarios, setUserActive } from '../api/usuarios'
export const useUsuarios = () => useQuery({ queryKey: ['usuarios'], queryFn: getUsuarios })
export function useUserMutation() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, active }: { id: number; active: boolean }) => setUserActive(id, active),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['usuarios'] }) } })
}
