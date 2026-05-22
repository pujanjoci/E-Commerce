import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Edit, Package, Eye } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 0;

type ProductCategory = { categories?: { name?: string | null } | null };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your store inventory and premium curation.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:bg-accent hover:text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-accent/25"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                        {product.images && product.images[0] ? (
                          <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-foreground truncate max-w-[200px]" title={product.name}>
                        {product.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
                      {(product as ProductCategory).categories?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap font-bold text-foreground">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                      ${product.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right flex items-center justify-end gap-2">
                    <Link 
                      href={`/products/${product.slug}`} 
                      title="View in Store"
                      className="p-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </Link>
                    <Link 
                      href={`/admin/products/${product.id}/edit`} 
                      title="Edit Product"
                      className="p-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors shadow-md hover:shadow-accent/25"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">
                    No products found. Establish your first curation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
