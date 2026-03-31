import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "./use-toast";
import { type User } from "@shared/schema";

export function useAdminUsers() {
    return useQuery<User[]>({
        queryKey: [api.admin.users.list.path],
        queryFn: async () => {
            const res = await fetch(api.admin.users.list.path);
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        },
    });
}

export function useApproveUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, isApproved }: { id: number; isApproved: boolean }) => {
            const url = buildUrl(api.admin.users.approve.path, { id });
            const res = await fetch(url, {
                method: api.admin.users.approve.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isApproved }),
            });
            if (!res.ok) throw new Error("Failed to update approval status");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
            toast({ title: "Success", description: "User approval status updated" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });
}

export function useUpdateUserRole() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, role }: { id: number; role: "user" | "co-admin" }) => {
            const url = buildUrl(api.admin.users.updateRole.path, { id });
            const res = await fetch(url, {
                method: api.admin.users.updateRole.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            if (!res.ok) throw new Error("Failed to update user role");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
            toast({ title: "Success", description: "User role updated" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: number) => {
            const url = buildUrl(api.admin.users.delete.path, { id });
            const res = await fetch(url, { method: api.admin.users.delete.method });
            if (!res.ok) throw new Error("Failed to delete user");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
            toast({ title: "Success", description: "User deleted successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });
}
