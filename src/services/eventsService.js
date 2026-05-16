import { supabase } from "./supabase";

const MAX_ACTIVE_EVENTS_PER_HOST = 3;

// Verifica cuántos eventos activos tiene el host
export async function countActiveEventsByHost(hostId) {
  const now = new Date().toISOString();
  const { count, error } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("host_id", hostId)
    .eq("status", "active")
    .gte("starts_at", now);
  if (error) throw error;
  return count || 0;
}

// Crea un evento. Si el host ya tiene 3 activos, falla.
export async function createEvent({
  hostId,
  title,
  description,
  type,
  locationText,
  city,
  latitude,
  longitude,
  meetingUrl,
  startsAt,
  endsAt,
  maxAttendees,
  coverUrl,
  tags,
}) {
  if (!hostId) throw new Error("Falta hostId");
  if (!title?.trim()) throw new Error("Título requerido");
  if (!type || !["in_person", "online"].includes(type)) throw new Error("Tipo inválido");
  if (!startsAt) throw new Error("Fecha requerida");
  if (type === "online" && !meetingUrl) throw new Error("URL de meeting requerida para encuentros online");
  if (type === "in_person" && !locationText) throw new Error("Ubicación requerida para encuentros presenciales");

  const activeCount = await countActiveEventsByHost(hostId);
  if (activeCount >= MAX_ACTIVE_EVENTS_PER_HOST) {
    throw new Error(`Ya tenés ${MAX_ACTIVE_EVENTS_PER_HOST} encuentros activos. Cancelá uno o esperá a que termine.`);
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      host_id: hostId,
      title: title.trim(),
      description: description?.trim() || null,
      type,
      location_text: locationText || null,
      city: city || null,
      latitude: latitude || null,
      longitude: longitude || null,
      meeting_url: meetingUrl || null,
      starts_at: startsAt,
      ends_at: endsAt || null,
      max_attendees: maxAttendees || null,
      cover_url: coverUrl || null,
      tags: tags || [],
    })
    .select()
    .single();

  if (error) throw error;

  // El host se agrega automáticamente como asistente
  await supabase.from("event_attendees").insert({
    event_id: data.id,
    user_id: hostId,
    status: "going",
  });

  return data;
}

// Lista eventos activos próximos (futuros), con info del host
export async function fetchUpcomingEvents({ city, limit = 50 } = {}) {
  const now = new Date().toISOString();
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (city) query = query.eq("city", city);

  const { data, error } = await query;
  if (error) throw error;
  if (!data || data.length === 0) return [];

  // Traer hosts
  const hostIds = [...new Set(data.map((e) => e.host_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos")
    .in("id", hostIds);

  // Traer counts de asistentes
  const eventIds = data.map((e) => e.id);
  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("event_id, user_id, status")
    .in("event_id", eventIds);

  return data.map((e) => {
    const host = profiles?.find((p) => p.id === e.host_id);
    const eventAttendees = attendees?.filter((a) => a.event_id === e.id) || [];
    return {
      ...e,
      host: {
        id: e.host_id,
        display_name: host?.display_name || "Therian",
        avatar: host?.avatar_url || host?.photos?.[0] || null,
      },
      goingCount: eventAttendees.filter((a) => a.status === "going").length,
      interestedCount: eventAttendees.filter((a) => a.status === "interested").length,
    };
  });
}

// Trae detalle completo de un evento con host + asistentes
export async function fetchEventDetail(eventId) {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (error) throw error;

  const { data: hostProfile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos, primary_theriotype")
    .eq("id", event.host_id)
    .maybeSingle();

  const { data: attendees } = await supabase
    .from("event_attendees")
    .select("user_id, status, created_at")
    .eq("event_id", eventId);

  const attendeeIds = attendees?.map((a) => a.user_id) || [];
  const { data: attendeeProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, photos, primary_theriotype")
    .in("id", attendeeIds.length > 0 ? attendeeIds : ["00000000-0000-0000-0000-000000000000"]);

  return {
    ...event,
    host: {
      id: event.host_id,
      display_name: hostProfile?.display_name || "Therian",
      avatar: hostProfile?.avatar_url || hostProfile?.photos?.[0] || null,
      primary_theriotype: hostProfile?.primary_theriotype,
    },
    attendees: (attendees || []).map((a) => {
      const p = attendeeProfiles?.find((pr) => pr.id === a.user_id);
      return {
        user_id: a.user_id,
        status: a.status,
        display_name: p?.display_name || "Therian",
        avatar: p?.avatar_url || p?.photos?.[0] || null,
        primary_theriotype: p?.primary_theriotype,
      };
    }),
  };
}

// RSVP / actualizar status del usuario para un evento
export async function rsvpEvent({ eventId, userId, status }) {
  if (!eventId || !userId) throw new Error("Faltan datos");
  if (!["going", "interested", "declined"].includes(status)) throw new Error("Status inválido");

  // Si declined, borrar la fila
  if (status === "declined") {
    await supabase.from("event_attendees").delete().eq("event_id", eventId).eq("user_id", userId);
    return null;
  }

  const { data: existing } = await supabase
    .from("event_attendees")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("event_attendees")
      .update({ status })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("event_attendees")
      .insert({ event_id: eventId, user_id: userId, status })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

// Cancelar evento (host)
export async function cancelEvent(eventId) {
  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", eventId);
  if (error) throw error;
}

// Listar eventos creados por el usuario (host)
export async function fetchMyEvents(hostId) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", hostId)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

// Listar eventos a los que el usuario está asistiendo o interesado
export async function fetchEventsImAttending(userId) {
  const { data: rsvps, error } = await supabase
    .from("event_attendees")
    .select("event_id, status")
    .eq("user_id", userId)
    .in("status", ["going", "interested"]);
  if (error) throw error;
  if (!rsvps || rsvps.length === 0) return [];

  const eventIds = rsvps.map((r) => r.event_id);
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .eq("status", "active");
  return (events || []).map((e) => ({
    ...e,
    myStatus: rsvps.find((r) => r.event_id === e.id)?.status,
  }));
}

// Suscripción Realtime a un evento (cuando llegan/se van asistentes)
export function subscribeToEvent(eventId, onChange) {
  const channel = supabase
    .channel(`event:${eventId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "event_attendees", filter: `event_id=eq.${eventId}` },
      onChange
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
