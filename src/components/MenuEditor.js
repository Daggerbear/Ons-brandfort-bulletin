// src/components/MenuEditor.js
// Shared menu + ordering editor. Used by the admin page and the owner page.
// The data logic lives in components/menu/useMenuData.js.
"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import { getText } from "@/components/menu/menuText";
import useMenuData from "@/components/menu/useMenuData";
import { sortItems } from "@/components/menu/menuHelpers";
import ItemRow from "@/components/menu/ItemRow";
import CategoriesPanel from "@/components/menu/CategoriesPanel";
import BulkTools from "@/components/menu/BulkTools";
import SettingsPanel from "@/components/menu/SettingsPanel";
import { Field, TextArea, SelectField, PrimaryButton } from "@/components/menu/menuUi";

export default function MenuEditor({ businessId, backHref, backLabel }) {
  const id = businessId;
  const { lang } = useLang();
  const t = getText(lang);
  const {
    business, settings, setSettings, categories, items, values,
    loading, savingSettings, notice,
    tab, setTab, search, setSearch, catFilter, setCatFilter,
    openCats, setOpenCats, expandedId, setExpandedId,
    showAdd, setShowAdd, newItem, setNewItem, nameRef,
    sortedCats, groupsByItem, choiceApi,
    patchItem, addItem, deleteItem, moveItem, duplicateItem,
    addCategory, patchCategory, moveCategory, deleteCategory,
    applyRows, saveSettings,
  } = useMenuData(id, t);

  const counts = useMemo(() => {
    const out = {};
    items.forEach((i) => {
      const k = i.category_id || "none";
      out[k] = (out[k] || 0) + 1;
    });
    return out;
  }, [items]);
  const outCount = items.filter((i) => !i.is_available).length;

  const needle = search.trim().toLowerCase();
  const visible = useMemo(
    () =>
      items.filter((i) => {
        if (catFilter === "out" && i.is_available) return false;
        if (catFilter === "none" && i.category_id) return false;
        if (catFilter !== "all" && catFilter !== "out" && catFilter !== "none" && i.category_id !== catFilter)
          return false;
        if (!needle) return true;
        return (
          i.name.toLowerCase().includes(needle) ||
          (i.description || "").toLowerCase().includes(needle)
        );
      }),
    [items, catFilter, needle],
  );

  const sections = useMemo(() => {
    const list = sortedCats
      .map((c) => ({ key: c.id, title: c.name, rows: sortItems(visible.filter((i) => i.category_id === c.id)) }))
      .filter((s) => s.rows.length > 0);
    const loose = sortItems(visible.filter((i) => !i.category_id));
    if (loose.length) list.push({ key: "none", title: t.chipNone, rows: loose });
    return list;
  }, [sortedCats, visible, t]);

  const filtering = needle !== "" || catFilter !== "all";
  const isOpen = (key) => filtering || openCats.has(key);
  const toggleCat = (key) =>
    setOpenCats((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // ---------- render -----------------------------------------------------------
  if (loading) return <Centered>{t.loading}</Centered>;
  if (!business || !settings) return <Centered>{t.notFound}</Centered>;

  const tabs = [
    ["items", t.tabItems],
    ["categories", t.tabCategories],
    ["tools", t.tabTools],
    ["settings", t.tabSettings],
  ];

  return (
    <main className="min-h-screen bg-neutral-950 px-4 pb-40 pt-6 text-white sm:px-6">
      {notice && (
        <div
          className={`fixed left-1/2 top-[4.25rem] z-50 -translate-x-1/2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
            notice.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <Link href={backHref} className="text-sm text-orange-400 hover:text-orange-300">
          {backLabel}
        </Link>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-500">{t.menuControls}</p>
            <h1 className="truncate text-2xl font-black">{business.name}</h1>
          </div>
          <a
            href={`/business/${id}/menu?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200 hover:border-orange-500"
          >
            {t.preview}
          </a>
        </div>

        <div className="sticky top-14 z-30 -mx-4 mt-4 bg-neutral-950/95 px-4 pb-2 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex gap-1 rounded-xl bg-neutral-900 p-1">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 rounded-lg px-2 py-2 text-sm font-semibold transition ${
                  tab === key ? "bg-orange-500 text-black" : "text-neutral-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "items" && (
            <div className="mt-2 space-y-2">
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.searchPh}
                  className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5 text-base text-white outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAdd((v) => !v)}
                  className="flex-shrink-0 rounded-lg bg-orange-500 px-3 py-2.5 text-sm font-bold text-black"
                >
                  {showAdd ? t.close : t.addItem}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Chip active={catFilter === "all"} onClick={() => setCatFilter("all")}>
                  {t.chipAll} · {items.length}
                </Chip>
                {sortedCats.map((c) => (
                  <Chip key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>
                    {c.name} · {counts[c.id] || 0}
                  </Chip>
                ))}
                {counts.none > 0 && (
                  <Chip active={catFilter === "none"} onClick={() => setCatFilter("none")}>
                    {t.chipNone} · {counts.none}
                  </Chip>
                )}
                {outCount > 0 && (
                  <Chip danger active={catFilter === "out"} onClick={() => setCatFilter("out")}>
                    {t.chipOut} · {outCount}
                  </Chip>
                )}
              </div>
            </div>
          )}
        </div>

        {tab === "items" && (
          <div className="mt-3 space-y-3">
            {showAdd && (
              <form onSubmit={addItem} className="space-y-3 rounded-xl border border-orange-500/40 bg-neutral-900 p-4">
                <p className="font-bold text-orange-400">{t.addTitle}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs text-neutral-400">{t.fName}</label>
                    <input
                      ref={nameRef}
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder={t.fNamePh}
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-base text-white outline-none focus:border-orange-500"
                    />
                  </div>
                  <Field
                    label={t.fPrice}
                    value={newItem.price}
                    onChange={(v) => setNewItem({ ...newItem, price: v })}
                    inputMode="decimal"
                    placeholder="65"
                  />
                </div>
                <SelectField
                  label={t.fCategory}
                  value={newItem.category_id}
                  onChange={(v) => setNewItem({ ...newItem, category_id: v })}
                >
                  <option value="">{t.noCategoryOption}</option>
                  {sortedCats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>
                <TextArea
                  label={t.fDesc}
                  value={newItem.description}
                  onChange={(v) => setNewItem({ ...newItem, description: v })}
                  placeholder={t.fDescPh}
                  rows={2}
                />
                <PrimaryButton type="submit" className="w-full">
                  {t.addBtn}
                </PrimaryButton>
              </form>
            )}

            {items.length === 0 && !showAdd && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 text-center">
                <p className="font-semibold">{t.noItems}</p>
                <p className="mt-1 text-sm text-neutral-400">{t.noItemsHint}</p>
              </div>
            )}
            {items.length > 0 && visible.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500">{t.noResults}</p>
            )}

            {sections.map((s) => (
              <section key={s.key}>
                <button
                  type="button"
                  onClick={() => toggleCat(s.key)}
                  className="flex w-full items-center justify-between rounded-lg bg-neutral-900 px-3 py-3 text-left"
                >
                  <span className="min-w-0 truncate font-bold text-orange-300">
                    {s.title}
                    <span className="ml-2 text-sm font-normal text-neutral-500">
                      {t.itemsCount(s.rows.length)}
                    </span>
                  </span>
                  <span className="text-neutral-500">{isOpen(s.key) ? "▾" : "▸"}</span>
                </button>
                {isOpen(s.key) && (
                  <div className="mt-2 space-y-2">
                    {s.rows.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        expanded={expandedId === item.id}
                        t={t}
                        categories={sortedCats}
                        siblingItems={sortItems(items.filter((i) => (i.category_id || null) === (item.category_id || null)))}
                        groups={groupsByItem[item.id] || []}
                        values={values}
                        onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        onPatch={patchItem}
                        onMove={moveItem}
                        onDuplicate={duplicateItem}
                        onDelete={deleteItem}
                        choiceApi={choiceApi}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {tab === "categories" && (
          <div className="mt-3">
            <CategoriesPanel
              t={t}
              categories={sortedCats}
              counts={counts}
              onAdd={addCategory}
              onPatch={patchCategory}
              onMove={moveCategory}
              onDelete={deleteCategory}
            />
          </div>
        )}

        {tab === "tools" && (
          <div className="mt-3">
            <BulkTools
              t={t}
              items={items}
              categories={sortedCats}
              onApplyRows={applyRows}
            />
          </div>
        )}

        {tab === "settings" && (
          <div className="mt-3">
            <SettingsPanel
              t={t}
              settings={settings}
              setSettings={setSettings}
              onSave={saveSettings}
              saving={savingSettings}
            />
          </div>
        )}
      </div>
    </main>
  );
}

function Chip({ active, danger, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? danger
            ? "border-red-500 bg-red-600 font-bold text-white"
            : "border-orange-500 bg-orange-500 font-bold text-black"
          : danger
            ? "border-red-900 text-red-300"
            : "border-neutral-700 text-neutral-300"
      }`}
    >
      {children}
    </button>
  );
}

function Centered({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 text-white">
      <p className="text-neutral-400">{children}</p>
    </main>
  );
}
