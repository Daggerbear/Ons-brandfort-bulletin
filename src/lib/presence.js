import { supabase } from "@/lib/supabase";

export function trackOnlinePlayers(game, onCountChange) {
  const channel = supabase.channel(`presence-${game}`, {
    config: { presence: { key: `${Date.now()}-${Math.random().toString(36).slice(2)}` } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      onCountChange(count);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}