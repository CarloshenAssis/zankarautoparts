import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-sidebar diagonal-stripes">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <BrandMark size="sm" />
          <p className="mt-3 text-sm text-muted-foreground">
            ZANKAR Auto Parts — qualidade, confiança e desempenho em cada peça. Sua escolha nos
            impulsiona a entregar sempre o melhor.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Endereço</h4>
          <p className="flex gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            Rua das Indústrias, 123
            <br />
            Bairro Industrial - São Paulo/SP
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">Contato</h4>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary" /> (11) 99999-9999
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 text-primary" /> contato@zankar.com.br
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 text-primary" /> www.zankar.com.br
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 text-primary" />
            Seg-Sex: 8h às 18h
            <br />
            Sáb: 8h às 13h
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary">
            Redes Sociais
          </h4>
          <div className="flex gap-2">
            <a
              href="#"
              className="grid h-11 w-11 place-items-center rounded-md border border-border hover:border-primary hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="grid h-11 w-11 place-items-center rounded-md border border-border hover:border-primary hover:text-primary"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="#"
              className="grid h-11 w-11 place-items-center rounded-md border border-border hover:border-primary hover:text-primary"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4 text-xs text-muted-foreground md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} ZANKAR Auto Parts. Todos os direitos reservados.</span>
          <span>CNPJ 00.000.000/0001-00</span>
        </div>
      </div>
    </footer>
  );
}
