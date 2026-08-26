"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";

const money = (amount) => `R${Number(amount || 0).toFixed(2)}`;

const labels = {
  af: {
    back: "Terug na besigheid",
    cart: "Jou bestelling",
    empty: "Jou mandjie is nog leeg.",
    add: "Voeg by",
    all: "Alles",
    chooseCategory: "Kies kategorie",
    collection: "Afhaal",
    delivery: "Aflewering",
    name: "Jou naam",
    namePlaceholder: "Tik jou naam hier",
    address: "Afleweringsadres",
    addressPlaceholder: "Tik jou adres hier",
    notePlaceholder: "Spesiale versoek (opsioneel)",
    order: "Bestel op WhatsApp",
    unavailable: "Aanlyn bestellings is tans nie beskikbaar nie.",
    noItems: "Geen beskikbare items in hierdie kategorie nie.",
    noOrderType: "Geen bestelmetode is tans beskikbaar nie.",
    addItems: "Voeg ten minste een item by jou bestelling.",
    choose: "Kies",
    requiredChoice: "Kies asseblief",
    itemTypes: "item tipes",
  },
  en: {
    back: "Back to business",
    cart: "Your order",
    empty: "Your cart is empty.",
    add: "Add",
    all: "All",
    chooseCategory: "Choose a category",
    collection: "Collection",
    delivery: "Delivery",
    name: "Your name",
    namePlaceholder: "Enter your name",
    address: "Delivery address",
    addressPlaceholder: "Enter your address",
    notePlaceholder: "Special request (optional)",
    order: "Order on WhatsApp",
    unavailable: "Online ordering is currently unavailable.",
    noItems: "No available items in this category.",
    noOrderType: "No order method is currently available.",
    addItems: "Add at least one item to your order.",
    choose: "Choose",
    requiredChoice: "Please choose",
    itemTypes: "item types",
  },
};

export default function BusinessMenuPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const [lang, setLang] = useState("af");
  const [business, setBusiness] = useState(null);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [optionGroups, setOptionGroups] = useState([]);
  const [optionValues, setOptionValues] = useState([]);
  const [itemChoices, setItemChoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const t = labels[lang];
  const isEnquiry = settings?.menu_mode === "enquiry";
  const enquiryCopy =
    lang === "af"
      ? {
          heading: "Aanlyn diensnavrae",
          cart: "Jou navraag",
          empty: "Kies ’n diens om ’n navraag te begin.",
          itemType: "diens",
          itemTypes: "dienste",
          choose: "Kies diens",
          selected: "Gekies",
          from: "Vanaf",
          notePlaceholder: "Vertel ons kortliks wat jy benodig (opsioneel)",
          send: "Stuur navraag op WhatsApp",
          intro: "Hi",
          messageTitle: "Ek wil graag ’n kwotasie/navraag hê vir:",
          name: "Naam",
          details: "My idee / besonderhede",
          closing:
            "Kan julle my asseblief met ’n persoonlike kwotasie help? Dankie!",
        }
      : {
          heading: "Online service enquiries",
          cart: "Your enquiry",
          empty: "Choose a service to start an enquiry.",
          itemType: "service",
          itemTypes: "services",
          choose: "Choose service",
          selected: "Selected",
          from: "From",
          notePlaceholder: "Briefly tell us what you need (optional)",
          send: "Send enquiry on WhatsApp",
          intro: "Hi",
          messageTitle: "I would like a quote/enquiry for:",
          name: "Name",
          details: "My idea / details",
          closing: "Please help me with a personalised quote. Thank you!",
        };

  useEffect(() => {
    if (!id) return;

    const loadMenu = async () => {
      setLoading(true);
      const [businessResult, settingsResult, categoriesResult, itemsResult] =
        await Promise.all([
          supabase
            .from("businesses")
            .select("id, name, description, address, hours, contact, logo_url")
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
            .eq("is_active", true)
            .order("sort_order"),
          supabase
            .from("menu_items")
            .select("*")
            .eq("business_id", id)
            .eq("is_available", true)
            .order("sort_order"),
        ]);

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

        loadedGroups = groupsResult.data || [];

        if (loadedGroups.length) {
          const valuesResult = await supabase
            .from("menu_item_option_values")
            .select("*")
            .in(
              "option_group_id",
              loadedGroups.map((group) => group.id),
            )
            .eq("is_available", true)
            .order("sort_order");

          loadedValues = valuesResult.data || [];
        }
      }

      setBusiness(businessResult.data || null);
      setSettings(settingsResult.data || null);
      setCategories(categoriesResult.data || []);
      setItems(loadedItems);
      setOptionGroups(loadedGroups);
      setOptionValues(loadedValues);

      if (settingsResult.data?.collection_enabled) setOrderType("collection");
      else if (settingsResult.data?.delivery_enabled) setOrderType("delivery");

      setLoading(false);
    };

    loadMenu();
  }, [id]);

  const categoryItems = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category_id === activeCategory);
  }, [activeCategory, items]);

  const groupedMenu = useMemo(() => {
    if (activeCategory !== "all") {
      const category = categories.find((entry) => entry.id === activeCategory);
      return category ? [{ ...category, items: categoryItems }] : [];
    }

    const grouped = categories
      .map((category) => ({
        ...category,
        items: items.filter((item) => item.category_id === category.id),
      }))
      .filter((category) => category.items.length > 0);

    const uncategorised = items.filter((item) => !item.category_id);
    if (uncategorised.length) {
      grouped.push({
        id: "uncategorised",
        name: lang === "af" ? "Ander" : "Other",
        items: uncategorised,
      });
    }
    return grouped;
  }, [activeCategory, categories, categoryItems, items, lang]);

  const itemsById = useMemo(
    () => Object.fromEntries(items.map((item) => [item.id, item])),
    [items],
  );

  const groupsByItem = useMemo(
    () =>
      optionGroups.reduce((all, group) => {
        if (!all[group.menu_item_id]) all[group.menu_item_id] = [];
        all[group.menu_item_id].push(group);
        return all;
      }, {}),
    [optionGroups],
  );

  const valuesByGroup = useMemo(
    () =>
      optionValues.reduce((all, value) => {
        if (!all[value.option_group_id]) all[value.option_group_id] = [];
        all[value.option_group_id].push(value);
        return all;
      }, {}),
    [optionValues],
  );

  const valuesById = useMemo(
    () => Object.fromEntries(optionValues.map((value) => [value.id, value])),
    [optionValues],
  );

  const cartItems = Object.entries(cart)
    .filter(([, entry]) => entry.quantity > 0)
    .map(([cartKey, entry]) => {
      const item = itemsById[entry.itemId];
      return item
        ? {
            ...item,
            cartKey,
            quantity: entry.quantity,
            selectedOptions: entry.selectedOptions || {},
          }
        : null;
    })
    .filter(Boolean);

  const optionSummary = (selectedOptions = {}) =>
    Object.entries(selectedOptions)
      .map(([groupId, valueId]) => {
        const group = optionGroups.find((entry) => entry.id === groupId);
        const value = valuesById[valueId];
        return group && value ? `${group.name}: ${value.name}` : "";
      })
      .filter(Boolean)
      .join(" · ");

  const itemUnitPrice = (item) => {
    const extras = Object.values(item.selectedOptions || {}).reduce(
      (sum, valueId) =>
        sum + Number(valuesById[valueId]?.price_adjustment || 0),
      0,
    );
    return Number(item.price) + extras;
  };

  const total = cartItems.reduce(
    (sum, item) => sum + itemUnitPrice(item) * item.quantity,
    0,
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const setItemChoice = (itemId, groupId, valueId) => {
    setItemChoices((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        [groupId]: valueId,
      },
    }));
  };

  const changeQuantity = (cartKey, change) => {
    setCart((current) => {
      const entry = current[cartKey];
      if (!entry) return current;
      const quantity = Math.max(0, entry.quantity + change);
      const next = { ...current };
      if (quantity) next[cartKey] = { ...entry, quantity };
      else delete next[cartKey];
      return next;
    });
  };

  const addToCart = (itemId) => {
    const itemGroups = groupsByItem[itemId] || [];
    const selectedOptions = itemChoices[itemId] || {};

    for (const group of itemGroups) {
      if (group.is_required && !selectedOptions[group.id]) {
        window.alert(`${t.requiredChoice} ${group.name}.`);
        return;
      }
    }

    const optionKey = Object.entries(selectedOptions)
      .filter(([, valueId]) => valueId)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([groupId, valueId]) => `${groupId}:${valueId}`)
      .join("|");
    const cartKey = optionKey ? `${itemId}|${optionKey}` : itemId;

    setCart((current) => {
      const existing = current[cartKey];
      return {
        ...current,
        [cartKey]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : { itemId, quantity: 1, selectedOptions },
      };
    });
  };

  const placeOrder = () => {
    if (!cartItems.length) return window.alert(t.addItems);

    const digits = (
      settings?.whatsapp_number ||
      business?.contact ||
      ""
    ).replace(/\D/g, "");
    if (!digits) {
      return window.alert("No WhatsApp number has been set for this menu yet.");
    }
    const number = digits.startsWith("0") ? `27${digits.slice(1)}` : digits;

    const orderLines = cartItems.map((item) => {
      const choices = optionSummary(item.selectedOptions);
      const selected = choices ? ` (${choices})` : "";
      const unitPrice = itemUnitPrice(item);
      return isEnquiry
        ? `• ${item.name}${selected} — ${enquiryCopy.from} ${money(unitPrice)}`
        : `• ${item.quantity} × ${item.name}${selected} — ${money(unitPrice * item.quantity)}`;
    });

    const typeLabel = orderType === "delivery" ? t.delivery : t.collection;
    const message = isEnquiry
      ? [
          `${enquiryCopy.intro} ${business?.name || ""},`,
          "",
          enquiryCopy.messageTitle,
          ...orderLines,
          "",
          `${enquiryCopy.name}: ${customerName.trim() || (lang === "af" ? "Nie verskaf nie" : "Not provided")}`,
          ...(note.trim() ? [`${enquiryCopy.details}: ${note.trim()}`] : []),
          "",
          enquiryCopy.closing,
        ]
      : [
          `Hi ${business?.name || ""}, I would like to place an order:`,
          "",
          ...orderLines,
          "",
          `*Total: ${money(total)}*`,
          "",
          `Name: ${customerName.trim() || "Not provided"}`,
          `Order type: ${typeLabel}`,
          ...(orderType === "delivery"
            ? [`Address: ${address.trim() || "To be confirmed"}`]
            : []),
          ...(note.trim() ? [`Special request: ${note.trim()}`] : []),
          "",
          "Please confirm my order and collection/delivery time. Thank you!",
        ];

    window.open(
      `https://wa.me/${number}?text=${encodeURIComponent(message.join("\n"))}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <p className="text-neutral-400 text-center mt-20">Loading menu…</p>
      </main>
    );
  }

  if (!business || (!settings?.menu_enabled && !isPreview)) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <div className="max-w-md mx-auto text-center mt-20">
          <p className="text-neutral-400 mb-6">{t.unavailable}</p>
          <a href={`/business/${id}`} className="text-orange-400 underline">
            ← {t.back}
          </a>
        </div>
      </main>
    );
  }

const canOrder =
    isEnquiry || settings.collection_enabled || settings.delivery_enabled;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-6 sm:px-6 sm:py-10">
      <Nav lang={lang} />
      <div className="max-w-3xl mx-auto mt-6 pb-10">
        {isPreview && !settings.menu_enabled && (
          <div className="mb-5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Preview only — this menu is not live on Ons Brandfort Bulletin yet.
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-6">
          <a
            href={`/business/${id}`}
            className="text-sm text-neutral-400 hover:text-orange-400 transition underline"
          >
            ← {t.back}
          </a>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <section className="rounded-3xl overflow-hidden border border-purple-500/40 bg-gradient-to-br from-purple-950 via-neutral-950 to-neutral-900 p-6 sm:p-8 mb-5">
          <div className="flex items-start gap-4">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt={`${business.name} logo`}
                className="shrink-0 h-16 w-16 rounded-2xl object-cover bg-white p-1 shadow-lg"
              />
            ) : (
              <div className="shrink-0 h-16 w-16 rounded-2xl bg-white text-purple-800 flex items-center justify-center text-2xl font-black shadow-lg">
                {business.name?.slice(0, 1)}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">
                {isEnquiry ? enquiryCopy.heading : "Online Menu"}
              </p>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {business.name}
              </h1>
              {(settings.order_notice || business.description) && (
                <p className="text-neutral-300 mt-2">
                  {settings.order_notice || business.description}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-sm">
            {business.hours && (
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-neutral-200">
                {business.hours}
              </div>
            )}
            {business.address && (
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-3 text-neutral-200">
                {business.address}
              </div>
            )}
          </div>
        </section>

        {canOrder && (
          <section className="mb-5 rounded-2xl border border-orange-500/40 bg-neutral-900 overflow-hidden shadow-lg">
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left hover:bg-neutral-800 transition"
              aria-expanded={cartOpen}
            >
              <div>
                <h2 className="font-bold">
                  {isEnquiry ? enquiryCopy.cart : t.cart}{" "}
                  {cartCount ? `(${cartCount})` : ""}
                </h2>
                <p className="text-sm text-neutral-400">
                  {cartItems.length
                    ? isEnquiry
                      ? `${cartItems.length} ${cartItems.length === 1 ? enquiryCopy.itemType : enquiryCopy.itemTypes}`
                      : `${cartItems.length} ${t.itemTypes}`
                    : isEnquiry
                      ? enquiryCopy.empty
                      : t.empty}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!isEnquiry && (
                  <p className="text-xl font-black text-orange-400">
                    {money(total)}
                  </p>
                )}
                <span className="text-orange-400 text-xl">
                  {cartOpen ? "⌃" : "⌄"}
                </span>
              </div>
            </button>

            {cartOpen && (
              <div className="border-t border-neutral-800 p-4 sm:p-5">
                {cartItems.length > 0 && (
                  <div className="border-b border-neutral-800 pb-3 mb-4 max-h-48 overflow-y-auto space-y-3">
                    {cartItems.map((item) => {
                      const choices = optionSummary(item.selectedOptions);
                      const unitPrice = itemUnitPrice(item);
                      return (
                        <div
                          key={item.cartKey}
                          className="flex items-start justify-between text-sm gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-neutral-300">
                              {item.quantity} × {item.name}
                            </p>
                            {choices && (
                              <p className="mt-0.5 text-xs text-orange-300">
                                {choices}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="rounded-lg border border-orange-500/50 overflow-hidden">
                              <button
                                onClick={() => changeQuantity(item.cartKey, -1)}
                                className="px-2 py-1 hover:bg-neutral-800"
                                aria-label={`Remove one ${item.name}`}
                              >
                                −
                              </button>
                              <button
                                onClick={() => changeQuantity(item.cartKey, 1)}
                                className="px-2 py-1 hover:bg-orange-500"
                                aria-label={`Add one ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-white whitespace-nowrap">
                              {isEnquiry
                                ? `${enquiryCopy.from} ${money(unitPrice)}`
                                : money(unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder={t.namePlaceholder}
                    aria-label={t.name}
                    className="w-full rounded-xl bg-neutral-800 border border-neutral-700 focus:border-orange-500 outline-none px-4 py-3 text-white placeholder:text-neutral-500"
                  />
                  {!isEnquiry && (
                    <div
                      className={`grid rounded-xl border border-neutral-700 overflow-hidden ${settings.collection_enabled && settings.delivery_enabled ? "grid-cols-2" : "grid-cols-1"}`}
                    >
                      {settings.collection_enabled && (
                        <button
                          onClick={() => setOrderType("collection")}
                          className={`py-3 font-semibold text-sm transition ${orderType === "collection" ? "bg-orange-500 text-white" : "bg-neutral-800 text-neutral-300"}`}
                        >
                          {t.collection}
                        </button>
                      )}
                      {settings.delivery_enabled && (
                        <button
                          onClick={() => setOrderType("delivery")}
                          className={`py-3 font-semibold text-sm transition ${orderType === "delivery" ? "bg-orange-500 text-white" : "bg-neutral-800 text-neutral-300"}`}
                        >
                          {t.delivery}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {!isEnquiry && orderType === "delivery" && (
                  <textarea
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={t.addressPlaceholder}
                    aria-label={t.address}
                    rows={2}
                    className="w-full mt-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-orange-500 outline-none px-4 py-3 text-white placeholder:text-neutral-500 resize-none"
                  />
                )}
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={
                    isEnquiry ? enquiryCopy.notePlaceholder : t.notePlaceholder
                  }
                  rows={2}
                  className="w-full mt-3 rounded-xl bg-neutral-800 border border-neutral-700 focus:border-orange-500 outline-none px-4 py-3 text-white placeholder:text-neutral-500 resize-none"
                />
                {!isEnquiry &&
                  (orderType === "delivery"
                    ? settings.delivery_note
                    : settings.collection_note) && (
                    <p className="text-xs text-neutral-500 mt-2">
                      {orderType === "delivery"
                        ? settings.delivery_note
                        : settings.collection_note}
                    </p>
                  )}
                <button
                  onClick={placeOrder}
                  disabled={!cartItems.length}
                  className="w-full mt-4 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition py-4 font-bold text-white"
                >
                  {isEnquiry
                    ? enquiryCopy.send
                    : `${t.order} · ${money(total)}`}
                </button>
              </div>
            )}
          </section>
        )}

        {!canOrder && (
          <p className="mb-5 text-sm text-neutral-400">{t.noOrderType}</p>
        )}

        <div className="mb-7">
          <p className="text-sm font-semibold text-neutral-300 mb-2">
            {t.chooseCategory}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory === "all" ? "bg-orange-500 text-white" : "bg-neutral-900 border border-neutral-700 text-neutral-300"}`}
            >
              {t.all}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory === category.id ? "bg-orange-500 text-white" : "bg-neutral-900 border border-neutral-700 text-neutral-300"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {groupedMenu.length === 0 && (
            <p className="text-neutral-400">{t.noItems}</p>
          )}
          {groupedMenu.map((category) => (
            <section key={category.id}>
              <h2 className="text-2xl font-bold text-orange-400">
                {category.name}
              </h2>
              <div className="grid gap-3 mt-4 sm:grid-cols-2">
                {category.items.map((item) => {
                  const itemGroups = groupsByItem[item.id] || [];
                  const hasChoices = itemGroups.length > 0;
                  const simpleEntry = cart[item.id];

return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 flex gap-3 justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-neutral-400 mt-1 leading-snug">
                            {item.description}
                          </p>
                        )}
                        <p className="text-orange-400 font-bold mt-3">
                          {isEnquiry
                            ? `${enquiryCopy.from} ${money(item.price)}`
                            : money(item.price)}
                        </p>

                        {itemGroups.map((group) => {
                          const selected =
                            itemChoices[item.id]?.[group.id] || "";
                          const values = valuesByGroup[group.id] || [];
                          return (
                            <label
                              key={group.id}
                              className="block mt-3 text-sm text-neutral-300"
                            >
                              <span className="block mb-1 font-medium">
                                {group.name}{" "}
                                {group.is_required && (
                                  <span className="text-orange-300">*</span>
                                )}
                              </span>
                              <select
                                value={selected}
                                onChange={(event) =>
                                  setItemChoice(
                                    item.id,
                                    group.id,
                                    event.target.value,
                                  )
                                }
                                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 focus:border-orange-500 outline-none px-3 py-2 text-white"
                              >
                                <option value="">
                                  {t.choose} {group.name}
                                </option>
                                {values.map((value) => (
                                  <option key={value.id} value={value.id}>
                                    {value.name}
                                    {Number(value.price_adjustment) > 0
                                      ? ` +${money(value.price_adjustment)}`
                                      : ""}
                                  </option>
                                ))}
                              </select>
                            </label>
                          );
                        })}
                      </div>

                      {canOrder &&
                        (hasChoices ? (
                          <button
                            onClick={() => addToCart(item.id)}
                            className="shrink-0 self-end rounded-lg bg-orange-500 hover:bg-orange-600 transition px-3 py-2 font-semibold text-sm"
                          >
                            + {isEnquiry ? enquiryCopy.choose : t.add}
                          </button>
                        ) : isEnquiry ? (
                          <button
                            onClick={() =>
                              simpleEntry
                                ? changeQuantity(item.id, -1)
                                : addToCart(item.id)
                            }
                            className={`shrink-0 self-end rounded-lg transition px-3 py-2 font-semibold text-sm ${simpleEntry ? "border border-orange-500/50 text-orange-300 hover:bg-neutral-800" : "bg-orange-500 hover:bg-orange-600"}`}
                          >
                            {simpleEntry
                              ? `✓ ${enquiryCopy.selected}`
                              : `+ ${enquiryCopy.choose}`}
                          </button>
                        ) : simpleEntry ? (
                          <div className="shrink-0 flex items-center self-end rounded-lg border border-orange-500/50 overflow-hidden">
                            <button
                              onClick={() => changeQuantity(item.id, -1)}
                              className="px-3 py-2 hover:bg-neutral-800 text-lg"
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center font-bold">
                              {simpleEntry.quantity}
                            </span>
                            <button
                              onClick={() => changeQuantity(item.id, 1)}
                              className="px-3 py-2 hover:bg-orange-500 text-lg"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item.id)}
                            className="shrink-0 self-end rounded-lg bg-orange-500 hover:bg-orange-600 transition px-3 py-2 font-semibold text-sm"
                          >
                            + {t.add}
                          </button>
                        ))}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}