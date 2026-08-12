"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const blankItem = {
  name: "",
  description: "",
  price: "",
  category_id: "",
};

export default function AdminBusinessMenuPage() {
  const { id } = useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [business, setBusiness] = useState(null);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newItem, setNewItem] = useState(blankItem);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem("adminAuth") === "true");
    setChecked(true);
  }, []);

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const loadData = async () => {
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

    const error =
      businessResult.error ||
      settingsResult.error ||
      categoriesResult.error ||
      itemsResult.error;
    if (error) notify(error.message);

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
    if (authenticated && id) loadData();
  }, [authenticated, id]);

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from("business_menu_settings").upsert(
      {
        business_id: Number(id),
        menu_enabled: settings.menu_enabled,
        collection_enabled: settings.collection_enabled,
        delivery_enabled: settings.delivery_enabled,
        whatsapp_number: settings.whatsapp_number.trim() || null,
        order_notice: settings.order_notice.trim() || null,
        collection_note: settings.collection_note.trim() || null,
        delivery_note: settings.delivery_note.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    );
    setSaving(false);
    if (error) return notify(error.message);
    notify("Settings saved");
    loadData();
  };

  const addCategory = async (event) => {
    event.preventDefault();
    if (!newCategory.trim()) return;

    const { error } = await supabase.from("menu_categories").insert({
      business_id: Number(id),
      name: newCategory.trim(),
      sort_order: categories.length + 1,
      is_active: true,
    });

    if (error) return notify(error.message);
    setNewCategory("");
    notify("Category added");
    loadData();
  };

  const updateCategory = async (categoryId, field, value) => {
    const { error } = await supabase
      .from("menu_categories")
      .update({ [field]: value })
      .eq("id", categoryId);
    if (error) return notify(error.message);
    loadData();
  };

  const deleteCategory = async (categoryId) => {
    if (
      !window.confirm(
        "Delete this category? Items will remain but become uncategorised.",
      )
    )
      return;
    const { error } = await supabase
      .from("menu_categories")
      .delete()
      .eq("id", categoryId);
    if (error) return notify(error.message);
    notify("Category deleted");
    loadData();
  };

  const addItem = async (event) => {
    event.preventDefault();
    if (!newItem.name.trim() || newItem.price === "") {
      return notify("Enter an item name and price");
    }

    const { error } = await supabase.from("menu_items").insert({
      business_id: Number(id),
      category_id: newItem.category_id || null,
      name: newItem.name.trim(),
      description: newItem.description.trim() || null,
      price: Number(newItem.price),
      is_available: true,
      sort_order: items.length + 1,
    });

    if (error) return notify(error.message);
    setNewItem({ ...blankItem, category_id: categories[0]?.id || "" });
    notify("Item added");
    loadData();
  };

  const updateItem = async (itemId, field, value) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ [field]: value })
      .eq("id", itemId);
    if (error) return notify(error.message);
    loadData();
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("Delete this menu item?")) return;
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);
    if (error) return notify(error.message);
    notify("Item deleted");
    loadData();
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
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        Loading menu controls...
      </main>
    );
  }

  if (!business || !settings) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white p-6">
        Business not found.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-8 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin/businesses" className="text-sm text-orange-400">
          ← Back to Businesses
        </Link>

        <div className="flex items-start justify-between gap-3 mt-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Menu controls
            </p>
            <h1 className="text-2xl font-bold mt-1">{business.name}</h1>
          </div>
          <a
            href={`/business/${id}/menu`}
            target="_blank"
            rel="noreferrer"
            className="text-sm border border-neutral-700 rounded-lg px-3 py-2"
          >
            Preview ↗
          </a>
        </div>

        {notice && (
          <p className="mt-4 rounded-lg bg-orange-500/10 border border-orange-500/40 px-3 py-2 text-sm text-orange-200">
            {notice}
          </p>
        )}

        <section className="mt-6 rounded-xl border border-orange-500/40 bg-neutral-900 p-4">
          <h2 className="text-lg font-bold text-orange-400">
            Ordering settings
          </h2>
          <div className="grid gap-3 mt-4 sm:grid-cols-3">
            <Toggle
              label="Menu live"
              checked={settings.menu_enabled}
              onChange={(value) =>
                setSettings({ ...settings, menu_enabled: value })
              }
            />
            <Toggle
              label="Collection"
              checked={settings.collection_enabled}
              onChange={(value) =>
                setSettings({ ...settings, collection_enabled: value })
              }
            />
            <Toggle
              label="Delivery"
              checked={settings.delivery_enabled}
              onChange={(value) =>
                setSettings({ ...settings, delivery_enabled: value })
              }
            />
          </div>
          <div className="grid gap-3 mt-4 sm:grid-cols-2">
            <TextInput
              label="WhatsApp number"
              value={settings.whatsapp_number || ""}
              onChange={(value) =>
                setSettings({ ...settings, whatsapp_number: value })
              }
              placeholder="065 755 6269"
            />
            <TextInput
              label="Short menu notice"
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
              placeholder="Delivery area, fee or note"
            />
          </div>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="mt-4 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-3 font-semibold"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
        </section>

        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="text-lg font-bold text-orange-400">Categories</h2>
          <form onSubmit={addCategory} className="flex gap-2 mt-4">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="e.g. Burgers"
              className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white"
            />
            <button className="rounded-lg bg-orange-500 px-4 font-semibold">
              Add
            </button>
          </form>
          <div className="space-y-2 mt-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex gap-2 items-center rounded-lg bg-neutral-800 p-3"
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
                  className="min-w-0 flex-1 bg-transparent border-b border-neutral-700 pb-1 text-white"
                />
                <label className="text-xs text-neutral-400">
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
                  type="button"
                  onClick={() => deleteCategory(category.id)}
                  className="text-sm text-red-400"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="text-lg font-bold text-orange-400">Add menu item</h2>
          <form onSubmit={addItem} className="grid gap-3 mt-4 sm:grid-cols-2">
            <TextInput
              label="Item name"
              value={newItem.name}
              onChange={(value) => setNewItem({ ...newItem, name: value })}
              placeholder="e.g. Beef Burger"
            />
            <TextInput
              label="Price (R)"
              type="number"
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
              label="Description"
              value={newItem.description}
              onChange={(value) =>
                setNewItem({ ...newItem, description: value })
              }
              placeholder="Optional"
            />
            <button className="sm:col-span-2 rounded-lg bg-orange-500 py-3 font-semibold">
              Add item
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <h2 className="text-lg font-bold text-orange-400">
            Current menu items
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Change text or price, then tap outside the field to save.
          </p>
          <div className="space-y-3 mt-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg bg-neutral-800 p-3">
                <div className="flex gap-2">
                  <input
                    defaultValue={item.name}
                    onBlur={(event) =>
                      updateItem(item.id, "name", event.target.value.trim())
                    }
                    className="min-w-0 flex-1 bg-transparent border-b border-neutral-700 pb-1 font-semibold text-white"
                  />
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="text-sm text-red-400"
                  >
                    Delete
                  </button>
                </div>
                <textarea
                  defaultValue={item.description || ""}
                  onBlur={(event) =>
                    updateItem(
                      item.id,
                      "description",
                      event.target.value.trim() || null,
                    )
                  }
                  placeholder="Description"
                  rows={2}
                  className="mt-2 w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-sm text-white"
                />
                <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Price
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
                      className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-2 py-2 text-white"
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
                      className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-2 py-2 text-white"
                    >
                      <option value="">No category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-end gap-2 pb-2 text-sm">
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
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex justify-between gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function TextInput({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white"
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
        className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white"
      />
    </div>
  );
}
