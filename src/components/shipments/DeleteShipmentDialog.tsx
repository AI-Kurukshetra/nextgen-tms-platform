"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteShipment } from "@/lib/actions/shipments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteShipmentDialogProps = {
  shipmentId: string;
  shipmentNumber: string;
  onDeleted: () => void;
  redirectTo?: string;
};

export function DeleteShipmentDialog({
  shipmentId,
  shipmentNumber,
  onDeleted,
  redirectTo,
}: DeleteShipmentDialogProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shipment?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {shipmentNumber}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-500"
            onClick={() => {
              startTransition(async () => {
                const result = await deleteShipment(shipmentId);
                if (result.error) {
                  toast.error(result.error);
                  return;
                }

                toast.success("Shipment deleted");
                onDeleted();
                if (redirectTo) {
                  router.push(redirectTo);
                }
              });
            }}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
