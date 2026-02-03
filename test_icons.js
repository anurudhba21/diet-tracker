import { Sun, Moon, LogOut, User, CheckCircle, Edit2, PlusCircle, Book, LayoutDashboard } from 'lucide-react';

console.log('Sun:', typeof Sun);
console.log('Moon:', typeof Moon);
console.log('LogOut:', typeof LogOut);
console.log('User:', typeof User);
console.log('CheckCircle:', typeof CheckCircle);
console.log('Edit2:', typeof Edit2);
console.log('PlusCircle:', typeof PlusCircle);
console.log('Book:', typeof Book);
console.log('LayoutDashboard:', typeof LayoutDashboard);

if (Sun && Moon && LogOut && User && CheckCircle && Edit2 && PlusCircle && Book && LayoutDashboard) {
    console.log("SUCCESS: All icons found.");
} else {
    console.log("FAILURE: Some icons missing.");
}
