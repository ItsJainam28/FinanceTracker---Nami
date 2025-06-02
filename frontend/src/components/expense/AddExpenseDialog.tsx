// src/components/expense/AddExpenseDialog.tsx
import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, PlusIcon } from "lucide-react";
import AddExpenseForm from "./AddExpenseForm";
import { Button } from "../ui/button";

export default function AddExpenseDialog() {
    const [open, setOpen] = useState(false);
  
    const handleSuccess = () => {
      setOpen(false);
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* Mobile: Circular FAB */}
          <button
            type="button"
            className="
              md:hidden
              fixed z-50
              bottom-6 right-6
              w-14 h-14
              bg-primary text-primary-foreground
              rounded-full
              shadow-lg hover:shadow-xl
              flex items-center justify-center
              hover:scale-105 active:scale-95
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
            "
          >
            <Plus className="w-6 h-6" />
          </button>
        </DialogTrigger>
  
        <DialogTrigger asChild>
          {/* Desktop: Rectangular button */}
          <Button 
            className="
              hidden md:flex
              fixed z-50
              bottom-6 right-6
              gap-2 px-4 py-2
              shadow-lg hover:shadow-xl
              transition-all duration-200
            "
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </DialogTrigger>
  
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add New Expense
            </DialogTitle>
          </DialogHeader>
          
          <AddExpenseForm onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    );
  }