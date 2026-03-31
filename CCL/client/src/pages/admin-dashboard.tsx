import { useAdminUsers, useApproveUser, useUpdateUserRole, useDeleteUser } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, UserCheck, UserX, Shield, ShieldAlert, User as UserIcon } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
    const { user: currentUser } = useAuth();
    const { data: users, isLoading } = useAdminUsers();
    const approveUser = useApproveUser();
    const updateUserRole = useUpdateUserRole();
    const deleteUser = useDeleteUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const isSuperAdmin = currentUser?.role === "super-admin";

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-display text-slate-900">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage users, approvals, and system roles.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[250px]">User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{user.username}</div>
                                            <div className="text-xs text-slate-500">ID: {user.id}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {isSuperAdmin && user.role !== "super-admin" ? (
                                        <Select
                                            defaultValue={user.role}
                                            onValueChange={(value: "user" | "co-admin") =>
                                                updateUserRole.mutate({ id: user.id, role: value })
                                            }
                                            disabled={updateUserRole.isPending}
                                        >
                                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="user">User</SelectItem>
                                                <SelectItem value="co-admin">Co-Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            {user.role === "super-admin" ? (
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 capitalize">
                                                    <ShieldAlert className="w-3 h-3" />
                                                    {user.role}
                                                </Badge>
                                            ) : user.role === "co-admin" || user.role === "admin" ? (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 capitalize">
                                                    <Shield className="w-3 h-3" />
                                                    {user.role}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 capitalize">
                                                    {user.role}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={user.isApproved}
                                            onCheckedChange={(checked) =>
                                                approveUser.mutate({ id: user.id, isApproved: checked })
                                            }
                                            disabled={approveUser.isPending || user.role === "super-admin"}
                                        />
                                        <span className="text-xs font-medium">
                                            {user.isApproved ? (
                                                <span className="text-emerald-600">Approved</span>
                                            ) : (
                                                <span className="text-amber-600">Pending</span>
                                            )}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-500 text-sm">
                                    {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                                        disabled={user.role === "super-admin" || deleteUser.isPending}
                                        onClick={() => {
                                            if (confirm(`Delete user "${user.username}"?`)) {
                                                deleteUser.mutate(user.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
