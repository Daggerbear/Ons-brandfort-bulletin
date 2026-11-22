// src/components/biz/templates.js
// The four business page layouts. Same information, different order and emphasis.
import BusinessReviews from "@/components/BusinessReviews";
import BusinessUpdates from "@/components/BusinessUpdates";
import ClaimBusinessButton from "@/components/ClaimBusinessButton";
import { ActionLink, Description, Hero, InfoCards, Services, SisterList } from "./BizParts";
import { safeTemplate } from "@/lib/bizTheme";

// ctx: { business, id, lang, t, cat, rating, links, menuEnabled, updates,
//        reviews, sisters, fetchReviews, track }
function UpdatesBlock({ ctx }) {
  return <BusinessUpdates updates={ctx.updates} lang={ctx.lang} />;
}

function ReviewsBlock({ ctx }) {
  return (
    <>
      <BusinessReviews
        businessId={ctx.id}
        reviews={ctx.reviews}
        lang={ctx.lang}
        onPosted={ctx.fetchReviews}
      />
      <ClaimBusinessButton businessId={ctx.business.id} ownerId={ctx.business.owner_id} />
    </>
  );
}

function Bottom({ ctx }) {
  return (
    <>
      <UpdatesBlock ctx={ctx} />
      <ReviewsBlock ctx={ctx} />
    </>
  );
}

function Wrap({ children }) {
  return <div className="max-w-lg mx-auto px-6 py-8 w-full flex-1">{children}</div>;
}

function ShareButton({ ctx }) {
  return (
    <a
      href={ctx.links.share}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => ctx.track("business_share")}
      className="flex items-center justify-center gap-2 w-full border border-green-600/60 text-green-400 hover:bg-green-600 hover:text-white transition font-semibold rounded-lg px-4 py-3 mb-8"
    >
      📤 {ctx.t.share}
    </a>
  );
}

const waLink = (ctx, className = "", size = "md") =>
  ctx.links.whatsapp && (
    <ActionLink
      href={ctx.links.whatsapp}
      kind="whatsapp"
      external
      onClick={() => ctx.track("business_whatsapp")}
      className={className}
      size={size}
    >
      💬 {ctx.t.whatsapp}
    </ActionLink>
  );

const callLink = (ctx, className = "", size = "md") =>
  ctx.links.call && (
    <ActionLink href={ctx.links.call} kind="outline" size={size} onClick={() => ctx.track("business_call")} className={className}>
      📞 {ctx.t.call}
    </ActionLink>
  );

const menuLink = (ctx, className = "", size = "md") =>
  ctx.menuEnabled && (
    <ActionLink
      href={`/business/${ctx.business.id}/menu`}
      kind="accent"
      size={size}
      onClick={() => ctx.track("business_menu_tap")}
      className={className}
    >
      📋 {ctx.t.menu}
    </ActionLink>
  );

const websiteLink = (ctx, className = "") =>
  ctx.links.website && (
    <ActionLink
      href={ctx.links.website}
      kind="ghost"
      external
      onClick={() => ctx.track("business_website")}
      className={className}
    >
      🌐 {ctx.t.website}
    </ActionLink>
  );

// 1. Classic (free): the original layout
function Classic({ ctx }) {
  const { business, t } = ctx;
  return (
    <>
      <Hero business={business} cat={ctx.cat} rating={ctx.rating} t={t} />
      <Wrap>
        <div className="space-y-3 mb-8">
          {waLink(ctx, "w-full")}
          <div className="grid grid-cols-2 gap-3">
            {callLink(ctx, "last:odd:col-span-2")}
            {menuLink(ctx, "last:odd:col-span-2")}
            {websiteLink(ctx, "last:odd:col-span-2")}
          </div>
          <ShareButton ctx={ctx} />
        </div>
        <Description text={business.description} />
        <Services services={business.services} t={t} variant="chips" />
        <SisterList sisters={ctx.sisters} lang={ctx.lang} t={t} />
        <InfoCards business={business} mapsLink={ctx.links.maps} onMaps={() => ctx.track("business_directions")} t={t} />
        <Bottom ctx={ctx} />
      </Wrap>
    </>
  );
}

// 2. Menu first: the order button is the first thing people see
function MenuFirst({ ctx }) {
  const { business, t } = ctx;
  return (
    <>
      <Hero business={business} cat={ctx.cat} rating={ctx.rating} t={t} />
      <Wrap>
        <div className="space-y-3 mb-8">
          {menuLink(ctx, "w-full", "lg")}
          <div className="grid grid-cols-2 gap-3">
            {waLink(ctx, "last:odd:col-span-2")}
            {callLink(ctx, "last:odd:col-span-2")}
          </div>
        </div>
        <InfoCards business={business} mapsLink={ctx.links.maps} onMaps={() => ctx.track("business_directions")} t={t} />
        <UpdatesBlock ctx={ctx} />
        <Description text={business.description} />
        <Services services={business.services} t={t} variant="chips" />
        <SisterList sisters={ctx.sisters} lang={ctx.lang} t={t} />
        {websiteLink(ctx, "w-full mb-3")}
        <ShareButton ctx={ctx} />
        <ReviewsBlock ctx={ctx} />
      </Wrap>
    </>
  );
}

// 3. Showcase: big header with the story, services as cards
function Showcase({ ctx }) {
  const { business, t } = ctx;
  return (
    <>
      <Hero business={business} cat={ctx.cat} rating={ctx.rating} t={t} big />
      <Wrap>
        <Services services={business.services} t={t} variant="cards" />
        <div className="grid grid-cols-2 gap-3 mb-8">
          {waLink(ctx, "col-span-2")}
          {callLink(ctx, "last:odd:col-span-2")}
          {menuLink(ctx, "last:odd:col-span-2")}
          {websiteLink(ctx, "last:odd:col-span-2")}
        </div>
        <SisterList sisters={ctx.sisters} lang={ctx.lang} t={t} />
        <InfoCards business={business} mapsLink={ctx.links.maps} onMaps={() => ctx.track("business_directions")} t={t} />
        <ShareButton ctx={ctx} />
        <Bottom ctx={ctx} />
      </Wrap>
    </>
  );
}

// 4. Contact first: WhatsApp, call and directions as big buttons on top
function ContactFirst({ ctx }) {
  const { business, t } = ctx;
  return (
    <>
      <Hero business={business} cat={ctx.cat} rating={ctx.rating} t={t} />
      <Wrap>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {waLink(ctx, "", "tile")}
          {callLink(ctx, "", "tile")}
          {ctx.links.maps && (
            <ActionLink
              href={ctx.links.maps}
              kind="accent"
              size="tile"
              external
              onClick={() => ctx.track("business_directions")}
            >
              📍 <span>{t.address}</span>
            </ActionLink>
          )}
        </div>
        <InfoCards business={business} mapsLink={ctx.links.maps} onMaps={() => ctx.track("business_directions")} t={t} />
        <Description text={business.description} />
        <Services services={business.services} t={t} variant="list" />
        <div className="grid grid-cols-2 gap-3 mb-8">
          {menuLink(ctx, "last:odd:col-span-2")}
          {websiteLink(ctx, "last:odd:col-span-2")}
        </div>
        <SisterList sisters={ctx.sisters} lang={ctx.lang} t={t} />
        <ShareButton ctx={ctx} />
        <Bottom ctx={ctx} />
      </Wrap>
    </>
  );
}

const LAYOUTS = { classic: Classic, menu: MenuFirst, showcase: Showcase, contact: ContactFirst };

export default function BusinessLayout({ template, ctx }) {
  const Layout = LAYOUTS[safeTemplate(template)];
  return <Layout ctx={ctx} />;
}
