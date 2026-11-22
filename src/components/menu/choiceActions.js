// src/components/menu/choiceActions.js
// Saving, deleting and copying a menu item's choices (flavour, sauce, size...).
import { supabase } from "@/lib/supabase";
import { parseValues } from "./menuHelpers";

export function makeChoiceApi({ t, flash, groups, values, groupsByItem, items, setGroups, setValues, fetchOptions }) {
  return {
    addGroup: async (itemId) => {
      const { data, error } = await supabase
        .from("menu_item_option_groups")
        .insert({
          menu_item_id: itemId,
          name: t.newGroupName,
          selection_type: "single",
          is_required: true,
          sort_order: (groupsByItem[itemId] || []).length + 1,
        })
        .select("*")
        .single();
      if (error) return flash(error.message, "error");
      setGroups((cur) => [...cur, data]);
      flash(t.groupAdded);
    },

    saveGroup: async (groupId, draft) => {
      const vals = parseValues(draft.values);
      if (!draft.name.trim()) return flash(t.needLabel, "error");
      if (!vals.length) return flash(t.needChoice, "error");
      const { error: ge } = await supabase
        .from("menu_item_option_groups")
        .update({ name: draft.name.trim(), is_required: !!draft.is_required, selection_type: "single" })
        .eq("id", groupId);
      if (ge) return flash(ge.message, "error");
      const { error: ce } = await supabase
        .from("menu_item_option_values")
        .delete()
        .eq("option_group_id", groupId);
      if (ce) return flash(ce.message, "error");
      const { data: saved, error: ve } = await supabase
        .from("menu_item_option_values")
        .insert(vals.map((v, k) => ({ option_group_id: groupId, name: v.name, price_adjustment: v.price_adjustment, sort_order: k + 1 })))
        .select("*");
      if (ve) return flash(ve.message, "error");
      setGroups((cur) =>
        cur.map((g) =>
          g.id === groupId ? { ...g, name: draft.name.trim(), is_required: !!draft.is_required } : g,
        ),
      );
      setValues((cur) => [...cur.filter((v) => v.option_group_id !== groupId), ...(saved || [])]);
      flash(t.choicesSaved);
    },

    deleteGroup: async (groupId) => {
      if (!window.confirm(t.confirmDelGroup)) return;
      const { error } = await supabase.from("menu_item_option_groups").delete().eq("id", groupId);
      if (error) return flash(error.message, "error");
      setGroups((cur) => cur.filter((g) => g.id !== groupId));
      setValues((cur) => cur.filter((v) => v.option_group_id !== groupId));
      flash(t.groupDeleted);
    },

    copyGroupTo: async (group, targetIds) => {
      const vals = values
        .filter((v) => v.option_group_id === group.id)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      if (!vals.length) return flash(t.needChoice, "error");
      const { data: made, error: ge } = await supabase
        .from("menu_item_option_groups")
        .insert(
          targetIds.map((tid) => ({
            menu_item_id: tid,
            name: group.name,
            selection_type: "single",
            is_required: group.is_required,
            sort_order: (groupsByItem[tid] || []).length + 1,
          })),
        )
        .select("*");
      if (ge) return flash(ge.message, "error");
      const { error: ve } = await supabase.from("menu_item_option_values").insert(
        (made || []).flatMap((ng) =>
          vals.map((v, k) => ({
            option_group_id: ng.id,
            name: v.name,
            price_adjustment: v.price_adjustment,
            is_available: v.is_available,
            sort_order: k + 1,
          })),
        ),
      );
      if (ve) return flash(ve.message, "error");
      await fetchOptions(items);
      flash(t.copiedOk(targetIds.length));
    },
  };
}
