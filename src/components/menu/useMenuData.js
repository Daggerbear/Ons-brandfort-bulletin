// src/components/menu/useMenuData.js
// All the menu editor's data: loading, saving and the instant on-screen updates.
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ITEM_COLS, CAT_COLS, pick, parsePrice, sortItems } from "./menuHelpers";
import { makeChoiceApi } from "./choiceActions";

const DEFAULT_SETTINGS = (id) => ({
  business_id: Number(id),
  menu_enabled: false,
  collection_enabled: true,
  delivery_enabled: false,
  whatsapp_number: "",
  order_notice: "",
  collection_note: "",
  delivery_note: "",
  menu_mode: "order",
  delivery_fee: 0,
  discount_enabled: false,
  discount_percent: "",
  discount_min_order: "",
  discount_ends_on: "",
  discount_note: "",
});

const EMPTY_NEW = { name: "", price: "", category_id: "", description: "" };

export default function useMenuData(id, t) {
  const [business, setBusiness] = useState(null);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [groups, setGroups] = useState([]);
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notice, setNotice] = useState(null);

  const [tab, setTab] = useState("items");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all"); // all | none | out | <category id>
  const [openCats, setOpenCats] = useState(() => new Set());
  const [expandedId, setExpandedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_NEW);
  const noticeTimer = useRef(null);
  const nameRef = useRef(null);

  const flash = (text, kind = "ok") => {
    setNotice({ text, kind });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), kind === "ok" ? 1800 : 5000);
  };

  // ---------- loading ----------------------------------------------------
  const fetchOptions = async (itemList) => {
    if (!itemList.length) {
      setGroups([]);
      setValues([]);
      return;
    }
    const g = await supabase
      .from("menu_item_option_groups")
      .select("*")
      .in("menu_item_id", itemList.map((i) => i.id))
      .order("sort_order");
    if (g.error) return flash(g.error.message, "error");
    const gl = g.data || [];
    let vl = [];
    if (gl.length) {
      const v = await supabase
        .from("menu_item_option_values")
        .select("*")
        .in("option_group_id", gl.map((x) => x.id))
        .order("sort_order");
      if (v.error) return flash(v.error.message, "error");
      vl = v.data || [];
    }
    setGroups(gl);
    setValues(vl);
  };

  const loadMenu = async () => {
    if (!id) return;
    setLoading(true);
    const [b, s, c, i] = await Promise.all([
      supabase.from("businesses").select("id, name, category").eq("id", id).maybeSingle(),
      supabase.from("business_menu_settings").select("*").eq("business_id", id).maybeSingle(),
      supabase.from("menu_categories").select("*").eq("business_id", id).order("sort_order"),
      supabase.from("menu_items").select("*").eq("business_id", id).order("sort_order"),
    ]);
    [b, s, c, i].filter((r) => r.error).forEach((r) => flash(r.error.message, "error"));
    const itemList = i.data || [];
    setBusiness(b.data || null);
    setSettings(s.data || DEFAULT_SETTINGS(id));
    setCategories(c.data || []);
    setItems(itemList);
    // Big menus start folded so the page is short; small ones start open
    setOpenCats(itemList.length <= 30 ? new Set([...(c.data || []).map((x) => x.id), "none"]) : new Set());
    setNewItem((cur) => ({ ...cur, category_id: c.data?.[0]?.id || "" }));
    await fetchOptions(itemList);
    setLoading(false);
  };

  useEffect(() => {
    if (id) loadMenu();
    return () => clearTimeout(noticeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ---------- derived ----------------------------------------------------
  const sortedCats = useMemo(() => sortItems(categories), [categories]);
  const groupsByItem = useMemo(() => {
    const m = {};
    sortItems(groups).forEach((g) => {
      (m[g.menu_item_id] = m[g.menu_item_id] || []).push(g);
    });
    return m;
  }, [groups]);

  // ---------- item actions (instant on screen, saved in the background) --
  const saveRows = async (rows, okText) => {
    const before = items;
    const byId = new Map(rows.map((r) => [r.id, r]));
    setItems((cur) => cur.map((i) => byId.get(i.id) || i));
    const { error } = await supabase
      .from("menu_items")
      .upsert(rows.map((r) => pick(r, ITEM_COLS)), { onConflict: "id" });
    if (error) {
      setItems(before);
      flash(error.message, "error");
      return false;
    }
    flash(okText || t.saved);
    return true;
  };

  const patchItem = async (itemId, patch) => {
    const prev = items.find((i) => i.id === itemId);
    if (!prev) return false;
    setItems((cur) => cur.map((i) => (i.id === itemId ? { ...i, ...patch } : i)));
    const { error } = await supabase.from("menu_items").update(patch).eq("id", itemId);
    if (error) {
      setItems((cur) => cur.map((i) => (i.id === itemId ? prev : i)));
      flash(error.message, "error");
      return false;
    }
    flash(t.saved);
    return true;
  };

  const nextSort = (categoryId) => {
    const same = items.filter((i) => (i.category_id || null) === (categoryId || null));
    return same.reduce((m, i) => Math.max(m, i.sort_order || 0), 0) + 1;
  };

  const addItem = async (e) => {
    e.preventDefault();
    const price = parsePrice(newItem.price);
    if (!newItem.name.trim() || price === null) return flash(t.needNamePrice, "error");
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        business_id: Number(id),
        category_id: newItem.category_id || null,
        name: newItem.name.trim(),
        description: newItem.description.trim() || null,
        price,
        sort_order: nextSort(newItem.category_id),
      })
      .select("*")
      .single();
    if (error) return flash(error.message, "error");
    setItems((cur) => [...cur, data]);
    setOpenCats((cur) => new Set(cur).add(data.category_id || "none"));
    setNewItem({ ...EMPTY_NEW, category_id: newItem.category_id });
    flash(t.addedOk);
    nameRef.current?.focus();
  };

  const deleteItem = async (item) => {
    if (!window.confirm(t.confirmDeleteItem(item.name))) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", item.id);
    if (error) return flash(error.message, "error");
    const gone = new Set(groups.filter((g) => g.menu_item_id === item.id).map((g) => g.id));
    setItems((cur) => cur.filter((i) => i.id !== item.id));
    setGroups((cur) => cur.filter((g) => g.menu_item_id !== item.id));
    setValues((cur) => cur.filter((v) => !gone.has(v.option_group_id)));
    setExpandedId(null);
    flash(t.deletedOk);
  };

  const moveItem = (item, dir) => {
    const sibs = sortItems(items.filter((i) => (i.category_id || null) === (item.category_id || null)));
    const from = sibs.findIndex((i) => i.id === item.id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= sibs.length) return;
    const arr = [...sibs];
    [arr[from], arr[to]] = [arr[to], arr[from]];
    const changed = arr
      .map((it, k) => ({ ...it, sort_order: k + 1 }))
      .filter((it) => it.sort_order !== sibs.find((s) => s.id === it.id).sort_order);
    if (changed.length) saveRows(changed);
  };

  const duplicateItem = async (item) => {
    const { data: row, error } = await supabase
      .from("menu_items")
      .insert({
        business_id: Number(id),
        category_id: item.category_id || null,
        name: `${item.name} ${t.copySuffix}`,
        description: item.description || null,
        price: item.price,
        is_available: item.is_available,
        sort_order: nextSort(item.category_id),
      })
      .select("*")
      .single();
    if (error) return flash(error.message, "error");
    const srcGroups = groupsByItem[item.id] || [];
    for (const g of srcGroups) {
      const { data: ng, error: ge } = await supabase
        .from("menu_item_option_groups")
        .insert({
          menu_item_id: row.id,
          name: g.name,
          selection_type: "single",
          is_required: g.is_required,
          sort_order: g.sort_order,
        })
        .select("id")
        .single();
      if (ge) return flash(ge.message, "error");
      const vals = values.filter((v) => v.option_group_id === g.id);
      if (vals.length) {
        const { error: ve } = await supabase.from("menu_item_option_values").insert(
          vals.map((v, k) => ({
            option_group_id: ng.id,
            name: v.name,
            price_adjustment: v.price_adjustment,
            is_available: v.is_available,
            sort_order: k + 1,
          })),
        );
        if (ve) return flash(ve.message, "error");
      }
    }
    setItems((cur) => [...cur, row]);
    await fetchOptions([...items, row]);
    setExpandedId(row.id);
    flash(t.duplicatedOk);
  };

  // ---------- categories ---------------------------------------------------
  const addCategory = async (name) => {
    const { data, error } = await supabase
      .from("menu_categories")
      .insert({
        business_id: Number(id),
        name,
        sort_order: categories.reduce((m, c) => Math.max(m, c.sort_order || 0), 0) + 1,
      })
      .select("*")
      .single();
    if (error) {
      flash(error.message, "error");
      return false;
    }
    setCategories((cur) => [...cur, data]);
    setNewItem((cur) => (cur.category_id ? cur : { ...cur, category_id: data.id }));
    flash(t.catAdded);
    return true;
  };

  const patchCategory = async (catId, patch) => {
    const prev = categories.find((c) => c.id === catId);
    setCategories((cur) => cur.map((c) => (c.id === catId ? { ...c, ...patch } : c)));
    const { error } = await supabase.from("menu_categories").update(patch).eq("id", catId);
    if (error) {
      setCategories((cur) => cur.map((c) => (c.id === catId ? prev : c)));
      return flash(error.message, "error");
    }
    flash(t.saved);
  };

  const moveCategory = async (cat, dir) => {
    const arr = [...sortedCats];
    const from = arr.findIndex((c) => c.id === cat.id);
    const to = from + dir;
    if (from < 0 || to < 0 || to >= arr.length) return;
    [arr[from], arr[to]] = [arr[to], arr[from]];
    const rows = arr.map((c, k) => ({ ...c, sort_order: k + 1 }));
    const before = categories;
    setCategories(rows);
    const { error } = await supabase
      .from("menu_categories")
      .upsert(rows.map((r) => pick(r, CAT_COLS)), { onConflict: "id" });
    if (error) {
      setCategories(before);
      return flash(error.message, "error");
    }
    flash(t.saved);
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(t.confirmDelCat)) return;
    const { error } = await supabase.from("menu_categories").delete().eq("id", cat.id);
    if (error) return flash(error.message, "error");
    setCategories((cur) => cur.filter((c) => c.id !== cat.id));
    setItems((cur) => cur.map((i) => (i.category_id === cat.id ? { ...i, category_id: null } : i)));
    if (catFilter === cat.id) setCatFilter("all");
    flash(t.catDeleted);
  };

  const choiceApi = makeChoiceApi({
    t,
    flash,
    groups,
    values,
    groupsByItem,
    items,
    setGroups,
    setValues,
    fetchOptions,
  });

  // ---------- bulk tools ------------------------------------------------------
  const applyRows = (rows, kind) =>
    saveRows(rows, kind === "price" ? t.pricesDone(rows.length) : t.stockDone(rows.length));

  // ---------- settings -------------------------------------------------------
  const saveSettings = async () => {
    if (!settings) return;
    const pct = Number(String(settings.discount_percent ?? "").replace(",", "."));
    if (settings.discount_enabled && !(pct >= 1 && pct <= 90)) return flash(t.discountBadPct, "error");
    setSavingSettings(true);
    const { error } = await supabase.from("business_menu_settings").upsert(
      {
        business_id: Number(id),
        menu_enabled: !!settings.menu_enabled,
        collection_enabled: !!settings.collection_enabled,
        delivery_enabled: !!settings.delivery_enabled,
        whatsapp_number: settings.whatsapp_number?.trim() || null,
        order_notice: settings.order_notice?.trim() || null,
        collection_note: settings.collection_note?.trim() || null,
        delivery_note: settings.delivery_note?.trim() || null,
        menu_mode: settings.menu_mode || "order",
        delivery_fee: parsePrice(settings.delivery_fee) ?? 0,
        discount_enabled: !!settings.discount_enabled,
        discount_percent: pct > 0 ? Math.min(90, Math.round(pct * 100) / 100) : null,
        discount_min_order: parsePrice(settings.discount_min_order) || null,
        discount_ends_on: settings.discount_ends_on || null,
        discount_note: (settings.discount_note || "").trim().slice(0, 300) || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    );
    setSavingSettings(false);
    if (error) return flash(error.message, "error");
    flash(t.settingsSaved);
  };

  return {
    business, settings, setSettings, categories, items, groups, values,
    loading, savingSettings, notice,
    tab, setTab, search, setSearch, catFilter, setCatFilter,
    openCats, setOpenCats, expandedId, setExpandedId,
    showAdd, setShowAdd, newItem, setNewItem, nameRef,
    sortedCats, groupsByItem, choiceApi,
    patchItem, addItem, deleteItem, moveItem, duplicateItem,
    addCategory, patchCategory, moveCategory, deleteCategory,
    applyRows, saveSettings,
  };
}
