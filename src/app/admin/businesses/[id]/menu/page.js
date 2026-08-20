"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const emptyItem = {
  name: "",
  description: "",
  price: "",
  category_id: "",
};

export default function AdminBusinessMenu() {
  const { id } = useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [business, setBusiness] = useState(null);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState(emptyItem);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem("adminAuth") === "true");
    setChecked(true);
  }, []);

  const showNotice = (text) => {
    setNotice(text);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const loadMenu = async () => {
    if (!id) return;
    setLoading(true);

    const [businessResult, settingsResult, categoriesResult, itemsResult] =
      await Promise.all([
        supabase
          .from("businesses")
          .select("id, name, category")
          .eq("id", id)
          .maybeSingle(),
        supabase
          .from("business_menu_settings")
          .select("*")
          .eq("business_id", id)
          .maybeSingle(),
        supabase
          .from("menu_categories")
          .select("*")
          .eq("business_id", id)
          .order("sort_order"),
        supabase
          .from("menu_items")
          .select("*")
          .eq("business_id", id)
          .order("sort_order"),
      ]);

    if (businessResult.error) showNotice(businessResult.error.message);
    if (settingsResult.error) showNotice(settingsResult.error.message);
    if (categoriesResult.error) showNotice(categoriesResult.error.message);
    if (itemsResult.error) showNotice(itemsResult.error.message);

    setBusiness(businessResult.data || null);
    setSettings(
      settingsResult.data || {
        business_id: Number(id),
        menu_enabled: false,
        collection_enabled: true,
        delivery_enabled: false,
        whatsapp_number: "",
        order_notice: "",
        collection_note: "",
        delivery_note: "",
        menu_mode: "order",
      },
    );
    setCategories(categoriesResult.data || []);
    setItems(itemsResult.data || []);
    setNewItem((current) => ({
      ...current,
      category_id: categoriesResult.data?.[0]?.id || "",
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated && id) loadMenu();
  }, [authenticated, id]);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase.from("business_menu_settings").upsert(
      {
        business_id: Number(id),
        menu_enabled: settings.menu_enabled,
        collection_enabled: settings.collection_enabled,
        delivery_enabled: settings.delivery_enabled,
        whatsapp_number: settings.whatsapp_number?.trim() || null,
        order_notice: settings.order_notice?.trim() || null,
        collection_note: settings.collection_note?.trim() || null,
        delivery_note: settings.delivery_note?.trim() || null,
        menu_mode: settings.menu_mode || "order",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    );
    setSaving(false);
    if (error) return showNotice(error.message);
    showNotice("Menu settings saved");
    loadMenu();
  };

  const addCategory = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) return;
    const { error } = await supabase.from("menu_categories").insert({
      business_id: Number(id),
      name: newCategory.trim(),
      sort_order: categories.length + 1,
    });
    if (error) return showNotice(error.message);
    setNewCategory("");
    showNotice("Category added");
    loadMenu();
  };

  const updateCategory = async (categoryId, field, value) => {
    const { error } = await supabase
      .from("menu_categories")
      .update({ [field]: value })
      .eq("id", categoryId);
    if (error) return showNotice(error.message);
    loadMenu();
  };

  const deleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Delete this category? Its items will stay on the menu without a category.",
      )
    )
      return;
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", categoryId);
    if (error) return showNotice(error.message);
    showNotice("Category deleted");
    loadMenu();
  };

  const addItem = async (event) => {
    event.preventDefault();
    if (!newItem.name.trim() || newItem.price === "") {
      return showNotice("Add an item name and price");
    }
    const { error } = await supabase.from("menu_items").insert({
      business_id: Number(id),
      category_id: newItem.category_id || null,
      name: newItem.name.trim(),
      description: newItem.description.trim() || null,
      price: Number(newItem.price),
      sort_order: items.length + 1,
    });
    if (error) return showNotice(error.message);
    setNewItem({ ...emptyItem, category_id: categories[0]?.id || "" });
    showNotice("Menu item added");
    loadMenu();
  };

  const updateItem = async (itemId, field, value) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ [field]: value })
      .eq("id", itemId);
    if (error) return showNotice(error.message);
    loadMenu();
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this menu item?")) return;
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);
    if (error) return showNotice(error.message);
    showNotice("Menu item deleted");
    loadMenu();
  };

  if (!checked) return null;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p className="text-neutral-400">
          Please{" "}
          <Link href="/admin" className="text-orange-400">
            log in
          </Link>{" "}
          first.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <p className="text-neutral-400">Loading menu controls...</p>
      </main>
    );
  }

  if (!business || !settings) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <p className="text-neutral-400">Business not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-8 sm:px-6 sm:py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/businesses"
          className="text-sm text-orange-400 hover:text-orange-300"
        >
          ← Back to Businesses
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4 mt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Menu controls
            </p>
            <h1 className="text-3xl font-bold">{business.name}</h1>
            <p className="text-neutral-400 mt-1">{business.category}</p>
          </div>
          <a
            href={`/business/${id}/menu?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-neutral-700 hover:border-orange-500 px-4 py-2 text-sm text-neutral-200"
          >
            Preview public menu ↗
          </a>
        </div>

        {notice && (
          <div className="mt-5 rounded-lg border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
            {notice}
          </div>
        )}

        <section className="mt-6 rounded-xl border border-orange-500/40 bg-neutral-900 p-5">
          <h2 className="text-xl font-bold text-orange-400">
            Ordering settings
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 mt-4">
            <Toggle
              label="Menu live"
              checked={settings.menu_enabled}
              onChange={(value) =>
                setSettings({ ...settings, menu_enabled: value })
              }
            />
            <Toggle
              label="Collection available"
              checked={settings.collection_enabled}
              onChange={(value) =>
                setSettings({ ...settings, collection_enabled: value })
              }
            />
            <Toggle
              label="Delivery available"
              checked={settings.delivery_enabled}
              onChange={(value) =>
                setSettings({ ...settings, delivery_enabled: value })
              }
            />
          </div>

          <div className="mt-4">
            <label className="block text-xs text-neutral-400 mb-1">Customer flow</label>
            <select
              value={settings.menu_mode || "order"}
              onChange={(event) =>
                setSettings({ ...settings, menu_mode: event.target.value })
              }
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white outline-none focus:border-orange-500"
            >
              <option value="order">Food / products — WhatsApp order</option>
              <option value="enquiry">Services — WhatsApp quote enquiry</option>
            </select>
            <p className="mt-2 text-xs text-neutral-500">
              Use quote enquiry for services with starting prices. It removes collection, delivery and order totals from the customer screen.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            <Field
              label="WhatsApp order number"
              value={settings.whatsapp_number || ""}
              onChange={(value) =>
                setSettings({ ...settings, whatsapp_number: value })
              }
              placeholder="065 755 6269"
            />
            <Field
              label="Short notice"
              value={settings.order_notice || ""}
              onChange={(value) =>
                setSettings({ ...settings, order_notice: value })
              }
              placeholder="Good food, made with love."
            />
            <TextArea
              label="Collection note"
              value={settings.collection_note || ""}
              onChange={(value) =>
                setSettings({ ...settings, collection_note: value })
              }
              placeholder="Collection instructions"
            />
            <TextArea
              label="Delivery note"
              value={settings.delivery_note || ""}
              onChange={(value) =>
                setSettings({ ...settings, delivery_note: value })
              }
              placeholder="Delivery area, fee or instructions"
            />
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="mt-4 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-5 py-3 font-semibold"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </section>

        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-bold text-orange-400">Categories</h2>
          <form onSubmit={addCategory} className="flex gap-2 mt-4">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="e.g. Burgers"
              className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white outline-none focus:border-orange-500"
            />
            <button className="rounded-lg bg-orange-500 hover:bg-orange-600 px-4 font-semibold">
              Add
            </button>
          </form>
          <div className="space-y-3 mt-4">
            {categories.length === 0 && (
              <p className="text-sm text-neutral-500">
                Add a category before adding menu items.
              </p>
            )}
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 rounded-lg bg-neutral-800 p-3"
              >
                <input
                  defaultValue={category.name}
                  onBlur={(event) =>
                    updateCategory(
                      category.id,
                      "name",
                      event.target.value.trim(),
                    )
                  }
                  className="min-w-0 flex-1 border-b border-neutral-700 bg-transparent pb-1 text-white outline-none focus:border-orange-500"
                />
                <label className="text-xs text-neutral-400">
                  Order{" "}
                  <input
                    type="number"
                    defaultValue={category.sort_order}
                    onBlur={(event) =>
                      updateCategory(
                        category.id,
                        "sort_order",
                        Number(event.target.value) || 0,
                      )
                    }
                    className="ml-1 w-12 rounded bg-neutral-900 px-1 py-1 text-white"
                  />
                </label>
                <label className="flex items-center gap-1 text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={category.is_active}
                    onChange={(event) =>
                      updateCategory(
                        category.id,
                        "is_active",
                        event.target.checked,
                      )
                    }
                  />{" "}
                  Visible
                </label>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="text-sm text-red-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-bold text-orange-400">Add menu item</h2>
          <form onSubmit={addItem} className="grid gap-3 mt-4 sm:grid-cols-2">
            <Field
              label="Item name"
              value={newItem.name}
              onChange={(value) => setNewItem({ ...newItem, name: value })}
              placeholder="e.g. Beef Burger"
            />
            <Field
              label="Price (R)"
              type="number"
              step="0.01"
              value={newItem.price}
              onChange={(value) => setNewItem({ ...newItem, price: value })}
              placeholder="59"
            />
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Category
              </label>
              <select
                value={newItem.category_id}
                onChange={(event) =>
                  setNewItem({ ...newItem, category_id: event.target.value })
                }
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <TextArea
              label="Description (optional)"
              value={newItem.description}
              onChange={(value) =>
                setNewItem({ ...newItem, description: value })
              }
              placeholder="What comes with it?"
            />
            <button className="sm:col-span-2 rounded-lg bg-orange-500 hover:bg-orange-600 py-3 font-semibold">
              Add menu item
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-xl font-bold text-orange-400">Menu items</h2>
          <p className="text-sm text-neutral-400 mt-1">
            Edit a field then tap outside it to save. Turn off Available when an
            item is sold out.
          </p>
          <div className="space-y-4 mt-5">
            {items.length === 0 && (
              <p className="text-sm text-neutral-500">No items yet.</p>
            )}
            {items.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl border p-4 ${item.is_available ? "border-neutral-700 bg-neutral-800" : "border-red-900/60 bg-red-950/20"}`}
              >
                <div className="flex gap-3">
                  <div className="min-w-0 flex-1">
                    <input
                      defaultValue={item.name}
                      onBlur={(event) =>
                        updateItem(item.id, "name", event.target.value.trim())
                      }
                      className="w-full border-b border-neutral-700 bg-transparent pb-1 font-semibold text-white outline-none focus:border-orange-500"
                    />
                    <textarea
                      defaultValue={item.description || ""}
                      onBlur={(event) =>
                        updateItem(
                          item.id,
                          "description",
                          event.target.value.trim() || null,
                        )
                      }
                      rows={2}
                      placeholder="Description (optional)"
                      className="mt-2 w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-sm text-red-400"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Price (R)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      defaultValue={item.price}
                      onBlur={(event) =>
                        updateItem(
                          item.id,
                          "price",
                          Number(event.target.value) || 0,
                        )
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Category
                    </label>
                    <select
                      defaultValue={item.category_id || ""}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "category_id",
                          event.target.value || null,
                        )
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-2 text-white"
                    >
                      <option value="">None</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      defaultValue={item.sort_order}
                      onBlur={(event) =>
                        updateItem(
                          item.id,
                          "sort_order",
                          Number(event.target.value) || 0,
                        )
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-2 text-white"
                    />
                  </div>
                  <label className="flex items-end gap-2 pb-2 text-sm text-neutral-200">
                    <input
                      type="checkbox"
                      checked={item.is_available}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "is_available",
                          event.target.checked,
                        )
                      }
                    />{" "}
                    Available
                  </label>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-orange-500"
      />
    </label>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", step }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <input
        value={value}
        type={type}
        step={step}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white outline-none focus:border-orange-500"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white outline-none focus:border-orange-500"
      />
    </div>
  );
}