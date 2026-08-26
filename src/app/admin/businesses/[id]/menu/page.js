"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const emptyItem = { name: "", description: "", price: "", category_id: "" };
const emptyChoice = { name: "", is_required: true, values: "" };

function buildDrafts(groups, values) {
  return Object.fromEntries(
    groups.map((group) => [
      group.id,
      {
        name: group.name || "",
        is_required: group.is_required !== false,
        values: values
          .filter((value) => value.option_group_id === group.id)
          .map((value) =>
            Number(value.price_adjustment) > 0
              ? `${value.name} | ${value.price_adjustment}`
              : value.name,
          )
          .join("\n"),
      },
    ]),
  );
}

function parseValues(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, pricePart] = line.split("|");
      const price = Number((pricePart || "").trim().replace(",", "."));
      return {
        name: namePart.trim(),
        price_adjustment: Number.isFinite(price) && price > 0 ? price : 0,
      };
    })
    .filter((value) => value.name);
}

export default function AdminBusinessMenu() {
  const { id } = useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [business, setBusiness] = useState(null);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [optionGroups, setOptionGroups] = useState([]);
  const [optionValues, setOptionValues] = useState([]);
  const [choiceDrafts, setChoiceDrafts] = useState({});
  const [copyFrom, setCopyFrom] = useState({});
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
    window.setTimeout(() => setNotice(""), 3000);
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

    [businessResult, settingsResult, categoriesResult, itemsResult]
      .filter((result) => result.error)
      .forEach((result) => showNotice(result.error.message));

    const loadedItems = itemsResult.data || [];
    let loadedGroups = [];
    let loadedValues = [];

    if (loadedItems.length) {
      const groupsResult = await supabase
        .from("menu_item_option_groups")
        .select("*")
        .in(
          "menu_item_id",
          loadedItems.map((item) => item.id),
        )
        .order("sort_order");

      if (groupsResult.error) showNotice(groupsResult.error.message);
      loadedGroups = groupsResult.data || [];

      if (loadedGroups.length) {
        const valuesResult = await supabase
          .from("menu_item_option_values")
          .select("*")
          .in(
            "option_group_id",
            loadedGroups.map((group) => group.id),
          )
          .order("sort_order");

        if (valuesResult.error) showNotice(valuesResult.error.message);
        loadedValues = valuesResult.data || [];
      }
    }

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
    setItems(loadedItems);
    setOptionGroups(loadedGroups);
    setOptionValues(loadedValues);
    setChoiceDrafts(buildDrafts(loadedGroups, loadedValues));
    setNewItem((current) => ({
      ...current,
      category_id: categoriesResult.data?.[0]?.id || "",
    }));
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated && id) loadMenu();
  }, [authenticated, id]);

  const groupsByItem = useMemo(
    () =>
      optionGroups.reduce((all, group) => {
        if (!all[group.menu_item_id]) all[group.menu_item_id] = [];
        all[group.menu_item_id].push(group);
        return all;
      }, {}),
    [optionGroups],
  );

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
        "Delete this category? Its items stay on the menu without a category.",
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

  const updateChoiceDraft = (groupId, field, value) => {
    setChoiceDrafts((current) => ({
      ...current,
      [groupId]: { ...current[groupId], [field]: value },
    }));
  };

  const addChoiceGroup = async (itemId) => {
    const { error } = await supabase.from("menu_item_option_groups").insert({
      menu_item_id: itemId,
      name: "Choose an option",
      selection_type: "single",
      is_required: true,
      sort_order: (groupsByItem[itemId] || []).length + 1,
    });
    if (error) return showNotice(error.message);
    showNotice("Dropdown added");
    loadMenu();
  };

  const saveChoiceGroup = async (groupId) => {
    const draft = choiceDrafts[groupId] || emptyChoice;
    const values = parseValues(draft.values || "");
    if (!draft.name.trim()) return showNotice("Add a dropdown label");
    if (!values.length) return showNotice("Add at least one choice");

    setSaving(true);
    const { error: groupError } = await supabase
      .from("menu_item_option_groups")
      .update({
        name: draft.name.trim(),
        is_required: Boolean(draft.is_required),
        selection_type: "single",
      })
      .eq("id", groupId);

    if (groupError) {
      setSaving(false);
      return showNotice(groupError.message);
    }

    const { error: clearError } = await supabase
      .from("menu_item_option_values")
      .delete()
      .eq("option_group_id", groupId);

    if (clearError) {
      setSaving(false);
      return showNotice(clearError.message);
    }

    const { error: valuesError } = await supabase
      .from("menu_item_option_values")
      .insert(
        values.map((value, index) => ({
          option_group_id: groupId,
          name: value.name,
          price_adjustment: value.price_adjustment,
          is_available: true,
          sort_order: index + 1,
        })),
      );

    setSaving(false);
    if (valuesError) return showNotice(valuesError.message);
    showNotice("Choices saved");
    loadMenu();
  };

  const copyChoiceGroup = async (sourceId, itemId) => {
    const source = optionGroups.find((group) => group.id === sourceId);
    const sourceValues = optionValues.filter(
      (value) => value.option_group_id === sourceId,
    );
    if (!source) return showNotice("Choose a dropdown to copy first");
    if (!sourceValues.length)
      return showNotice("That dropdown has no choices yet");

    setSaving(true);
    const { data: newGroup, error: groupError } = await supabase
      .from("menu_item_option_groups")
      .insert({
        menu_item_id: itemId,
        name: source.name,
        selection_type: "single",
        is_required: source.is_required,
        sort_order: (groupsByItem[itemId] || []).length + 1,
      })
      .select("id")
      .single();

    if (groupError) {
      setSaving(false);
      return showNotice(groupError.message);
    }

    const { error: valuesError } = await supabase
      .from("menu_item_option_values")
      .insert(
        sourceValues.map((value, index) => ({
          option_group_id: newGroup.id,
          name: value.name,
          price_adjustment: value.price_adjustment,
          is_available: value.is_available,
          sort_order: index + 1,
        })),
      );

setSaving(false);
    if (valuesError) return showNotice(valuesError.message);
    showNotice("Dropdown copied");
    loadMenu();
  };

  const deleteChoiceGroup = async (groupId) => {
    if (!window.confirm("Delete this dropdown and all its choices?")) return;
    const { error } = await supabase
      .from("menu_item_option_groups")
      .delete()
      .eq("id", groupId);
    if (error) return showNotice(error.message);
    showNotice("Dropdown deleted");
    loadMenu();
  };

  if (!checked) return null;
  if (!authenticated)
    return (
      <Centered>
        Please{" "}
        <Link href="/admin" className="text-orange-400">
          log in
        </Link>{" "}
        first.
      </Centered>
    );
  if (loading) return <Centered>Loading menu controls...</Centered>;
  if (!business || !settings) return <Centered>Business not found.</Centered>;

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
            <label className="block text-xs text-neutral-400 mb-1">
              Customer flow
            </label>
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
              Use quote enquiry for services with starting prices. It removes
              collection, delivery and totals from the customer screen.
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
            <Select
              label="Category"
              value={newItem.category_id}
              onChange={(value) =>
                setNewItem({ ...newItem, category_id: value })
              }
              options={categories}
            />
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
            Edit a field then tap outside it to save. Open Product choices only
            for a flavour, sauce, bread or size dropdown.
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
                  <NumberField
                    label="Price (R)"
                    defaultValue={item.price}
                    onBlur={(value) => updateItem(item.id, "price", value)}
                  />
                  <Select
                    label="Category"
                    value={item.category_id || ""}
                    onChange={(value) =>
                      updateItem(item.id, "category_id", value || null)
                    }
                    options={categories}
                  />
                  <NumberField
                    label="Order"
                    defaultValue={item.sort_order}
                    onBlur={(value) => updateItem(item.id, "sort_order", value)}
                  />
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
                <ChoiceEditor
                  item={item}
                  groups={groupsByItem[item.id] || []}
                  drafts={choiceDrafts}
                  allGroups={optionGroups}
                  copyFrom={copyFrom[item.id] || ""}
                  saving={saving}
                  setCopyFrom={(value) =>
                    setCopyFrom({ ...copyFrom, [item.id]: value })
                  }
                  updateDraft={updateChoiceDraft}
                  addGroup={addChoiceGroup}
                  saveGroup={saveChoiceGroup}
                  copyGroup={copyChoiceGroup}
                  deleteGroup={deleteChoiceGroup}
                />
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
function ChoiceEditor({
  item,
  groups,
  drafts,
  allGroups,
  copyFrom,
  saving,
  setCopyFrom,
  updateDraft,
  addGroup,
  saveGroup,
  copyGroup,
  deleteGroup,
}) {
  return (
    <details className="mt-4 rounded-lg border border-neutral-700 bg-neutral-900/70 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-orange-300">
        Product choices — flavours, sauces, bread, sizes
      </summary>
      <p className="mt-2 text-xs text-neutral-500">
        One choice per line. Optional extra charge format: Extra cheese | 10.
        For the second milkshake size, copy the first flavour dropdown.
      </p>
      <div className="space-y-4 mt-4">
        {groups.map((group) => {
          const draft = drafts[group.id] || emptyChoice;
          return (
            <div
              key={group.id}
              className="rounded-lg border border-neutral-700 bg-neutral-800 p-3"
            >
              <div className="flex gap-3">
                <div className="min-w-0 flex-1">
                  <Field
                    label="Dropdown label"
                    value={draft.name}
                    onChange={(value) => updateDraft(group.id, "name", value)}
                    placeholder="e.g. Choose flavour"
                  />
                </div>
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="self-end mb-3 text-sm text-red-400"
                >
                  Delete
                </button>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={draft.is_required}
                  onChange={(event) =>
                    updateDraft(group.id, "is_required", event.target.checked)
                  }
                />{" "}
                Customer must choose one
              </label>
              <TextArea
                label="Choices — one per line"
                value={draft.values}
                onChange={(value) => updateDraft(group.id, "values", value)}
                placeholder={"Strawberry\nChocolate\nBubblegum"}
              />
              <button
                onClick={() => saveGroup(group.id)}
                disabled={saving}
                className="mt-3 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-4 py-2 text-sm font-semibold"
              >
                Save choices
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => addGroup(item.id)}
          className="rounded-lg border border-orange-500/60 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500/10"
        >
          + Add dropdown
        </button>
        {allGroups.length > 0 && (
          <>
            <select
              value={copyFrom}
              onChange={(event) => setCopyFrom(event.target.value)}
              className="min-w-0 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
            >
              <option value="">Copy an existing dropdown…</option>
              {allGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => copyGroup(copyFrom, item.id)}
              disabled={!copyFrom || saving}
              className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-200 disabled:opacity-40"
            >
              Copy choices
            </button>
          </>
        )}
      </div>
    </details>
  );
}

function Centered({ children }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <p className="text-neutral-400">{children}</p>
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
        rows={4}
        className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-white outline-none focus:border-orange-500"
      />
    </div>
  );
}
function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-2 text-white"
      >
        <option value="">None</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}
function NumberField({ label, defaultValue, onBlur }) {
  return (
    <div>
      <label className="block text-xs text-neutral-400 mb-1">{label}</label>
      <input
        type="number"
        step="0.01"
        defaultValue={defaultValue}
        onBlur={(event) => onBlur(Number(event.target.value) || 0)}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-2 text-white"
      />
    </div>
  );
}