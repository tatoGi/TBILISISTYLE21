import type { Metadata } from "next";
import Link from "next/link";
import { isAdminConfigured, isAdminSession } from "@/lib/admin-auth";
import { listTickets, type Ticket } from "@/lib/tickets";
import {
  createTicket,
  deleteTicket,
  loginAdmin,
  logoutAdmin,
  updateTicket,
} from "./actions";

export const metadata: Metadata = {
  title: "Admin | Tbilisi Style 21",
};

type AdminPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-white/80">
      {label}
      <input
        className="h-11 border border-white/15 bg-white/10 px-3 text-white outline-none transition focus:border-yellow-300"
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}

function TicketForm({ ticket }: { ticket?: Ticket }) {
  const action = ticket ? updateTicket : createTicket;

  return (
    <form action={action} className="grid gap-4 border border-white/10 p-5">
      {ticket ? <input type="hidden" name="id" value={ticket.id} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="სახელი"
          name="title"
          defaultValue={ticket?.title}
          required
        />
        <Field
          label="ფასი GEL"
          name="priceGel"
          type="number"
          defaultValue={ticket?.priceGel ?? 0}
          required
        />
        <Field
          label="თარიღი"
          name="eventDate"
          type="date"
          defaultValue={ticket?.eventDate}
        />
        <Field
          label="რაოდენობა"
          name="quantity"
          type="number"
          defaultValue={ticket?.quantity ?? 0}
        />
        <Field
          label="ლოკაცია"
          name="location"
          defaultValue={ticket?.location}
        />
        <Field
          label="ყიდვის ბმული"
          name="saleUrl"
          type="url"
          defaultValue={ticket?.saleUrl}
        />
      </div>

      <label className="grid gap-2 text-sm font-semibold text-white/80">
        სტატუსი
        <select
          className="h-11 border border-white/15 bg-black px-3 text-white outline-none transition focus:border-yellow-300"
          name="status"
          defaultValue={ticket?.status || "draft"}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="sold_out">Sold out</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm font-semibold text-white/80">
        აღწერა
        <textarea
          className="min-h-28 resize-y border border-white/15 bg-white/10 p-3 text-white outline-none transition focus:border-yellow-300"
          name="description"
          defaultValue={ticket?.description}
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button className="h-11 bg-yellow-300 px-5 text-sm font-black uppercase text-black transition hover:bg-white">
          {ticket ? "შენახვა" : "დამატება"}
        </button>
      </div>
    </form>
  );
}

function LoginForm({ error }: { error?: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-5 text-white">
      <form
        action={loginAdmin}
        className="grid w-full max-w-sm gap-5 border border-white/10 p-6"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
            Tbilisi Style 21
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase">Admin</h1>
        </div>

        {!isAdminConfigured() ? (
          <p className="border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100">
            ADMIN_PASSWORD env ცვლადი ჯერ არ არის დაყენებული.
          </p>
        ) : null}

        {error ? (
          <p className="border border-yellow-300/40 bg-yellow-300/10 p-3 text-sm text-yellow-100">
            პაროლი არასწორია ან სესია დასრულდა.
          </p>
        ) : null}

        <Field label="პაროლი" name="password" type="password" required />
        <button className="h-11 bg-yellow-300 px-5 text-sm font-black uppercase text-black transition hover:bg-white">
          შესვლა
        </button>
      </form>
    </main>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const authenticated = await isAdminSession();

  if (!authenticated) {
    return <LoginForm error={params.error} />;
  }

  const tickets = await listTickets();

  return (
    <main className="min-h-screen bg-black px-5 py-8 text-white md:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-300">
              Tbilisi Style 21
            </p>
            <h1 className="mt-2 text-3xl font-black uppercase">ბილეთები</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/tickets"
              className="border border-white/20 px-4 py-3 text-xs font-bold uppercase text-white transition hover:border-yellow-300 hover:text-yellow-300"
            >
              ნახვა საიტზე
            </Link>
            <form action={logoutAdmin}>
              <button className="border border-white/20 px-4 py-3 text-xs font-bold uppercase text-white/70 transition hover:border-white hover:text-white">
                გამოსვლა
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-3">
          <h2 className="text-xl font-black uppercase">ახალი ბილეთი</h2>
          <TicketForm />
        </section>

        <section className="grid gap-4">
          <h2 className="text-xl font-black uppercase">არსებული ბილეთები</h2>
          {tickets.length ? (
            <div className="grid gap-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="grid gap-4 border border-white/10 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black uppercase">{ticket.title}</p>
                      <p className="text-sm text-white/55">
                        {ticket.status} · {ticket.priceGel} GEL ·{" "}
                        {ticket.quantity} ცალი
                      </p>
                    </div>
                    <form action={deleteTicket}>
                      <input type="hidden" name="id" value={ticket.id} />
                      <button className="border border-red-400/40 px-4 py-2 text-xs font-bold uppercase text-red-100 transition hover:bg-red-500/20">
                        წაშლა
                      </button>
                    </form>
                  </div>
                  <TicketForm ticket={ticket} />
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-white/10 p-5 text-white/60">
              ბილეთი ჯერ არ არის დამატებული.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
