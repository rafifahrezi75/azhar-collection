<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function page()
    {
        return Inertia::render('Pelanggan/Index');
    }

    public function index()
    {
        $customers = Customer::latest()->get();

        return response()->json([
            'data' => $customers,
        ]);
    }

    public function nextCode()
    {
        return response()->json([
            'code' => $this->getGeneratedNextCode(),
        ]);
    }

    private function getGeneratedNextCode(): string
    {
        // Get all customer codes starting with CUST-
        $codes = Customer::where('code', 'LIKE', 'CUST-%')->pluck('code');

        $maxNumber = 0;
        foreach ($codes as $code) {
            if (preg_match('/CUST-(\d+)/i', $code, $matches)) {
                $num = (int)$matches[1];
                if ($num > $maxNumber) {
                    $maxNumber = $num;
                }
            }
        }

        $nextNumber = $maxNumber + 1;
        return 'CUST-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:customers,code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $customer = Customer::create([
            'code' => strtoupper(trim($validated['code'])),
            'name' => trim($validated['name']),
            'type' => trim($validated['type']),
            'institution_name' => !empty($validated['institution_name']) ? trim($validated['institution_name']) : null,
            'contact_person' => !empty($validated['contact_person']) ? trim($validated['contact_person']) : null,
            'phone' => !empty($validated['phone']) ? trim($validated['phone']) : null,
            'email' => !empty($validated['email']) ? trim($validated['email']) : null,
            'address' => !empty($validated['address']) ? trim($validated['address']) : null,
            'notes' => !empty($validated['notes']) ? trim($validated['notes']) : null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => "Data pelanggan '{$customer->name}' berhasil ditambahkan.",
            'data' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('customers', 'code')->ignore($customer->id)],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'institution_name' => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $customer->update([
            'code' => strtoupper(trim($validated['code'])),
            'name' => trim($validated['name']),
            'type' => trim($validated['type']),
            'institution_name' => !empty($validated['institution_name']) ? trim($validated['institution_name']) : null,
            'contact_person' => !empty($validated['contact_person']) ? trim($validated['contact_person']) : null,
            'phone' => !empty($validated['phone']) ? trim($validated['phone']) : null,
            'email' => !empty($validated['email']) ? trim($validated['email']) : null,
            'address' => !empty($validated['address']) ? trim($validated['address']) : null,
            'notes' => !empty($validated['notes']) ? trim($validated['notes']) : null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => "Data pelanggan '{$customer->name}' berhasil diperbarui.",
            'data' => $customer,
        ]);
    }

    public function destroy(Customer $customer)
    {
        $customerName = $customer->name;
        $customer->delete();

        return response()->json([
            'message' => "Data pelanggan '{$customerName}' berhasil dihapus.",
        ]);
    }
}
