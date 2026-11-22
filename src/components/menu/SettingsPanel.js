// src/components/menu/SettingsPanel.js
"use client";
import { Card, Field, TextArea, Toggle, SelectField, PrimaryButton } from "./menuUi";

export default function SettingsPanel({ t, settings, setSettings, onSave, saving }) {
  const set = (field) => (value) => setSettings({ ...settings, [field]: value });

  return (
    <Card title={t.settingsTitle}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Toggle label={t.menuLive} checked={!!settings.menu_enabled} onChange={set("menu_enabled")} />
        <Toggle
          label={t.collection}
          checked={!!settings.collection_enabled}
          onChange={set("collection_enabled")}
        />
        <Toggle
          label={t.delivery}
          checked={!!settings.delivery_enabled}
          onChange={set("delivery_enabled")}
        />
      </div>

      {settings.delivery_enabled && (
        <div className="mt-4">
          <Field
            label={t.deliveryFee}
            value={settings.delivery_fee ?? ""}
            onChange={set("delivery_fee")}
            inputMode="decimal"
            placeholder="30"
          />
          <p className="mt-2 text-xs text-neutral-500">{t.deliveryFeeHelp}</p>
        </div>
      )}

      <div className="mt-4">
        <SelectField
          label={t.flow}
          value={settings.menu_mode || "order"}
          onChange={set("menu_mode")}
        >
          <option value="order">{t.flowOrder}</option>
          <option value="enquiry">{t.flowEnquiry}</option>
        </SelectField>
        <p className="mt-2 text-xs text-neutral-500">{t.flowHelp}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field
          label={t.waLabel}
          value={settings.whatsapp_number || ""}
          onChange={set("whatsapp_number")}
          placeholder={t.waPh}
          inputMode="tel"
        />
        <Field
          label={t.noticeLabel}
          value={settings.order_notice || ""}
          onChange={set("order_notice")}
          placeholder={t.noticePh}
        />
        <TextArea
          label={t.collectionNote}
          value={settings.collection_note || ""}
          onChange={set("collection_note")}
          placeholder={t.collectionNotePh}
        />
        <TextArea
          label={t.deliveryNote}
          value={settings.delivery_note || ""}
          onChange={set("delivery_note")}
          placeholder={t.deliveryNotePh}
        />
      </div>

      <PrimaryButton type="button" onClick={onSave} disabled={saving} className="mt-4">
        {saving ? t.savingSettings : t.saveSettings}
      </PrimaryButton>
    </Card>
  );
}
