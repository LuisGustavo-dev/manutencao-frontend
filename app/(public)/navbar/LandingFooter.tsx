'use client';

import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-10 px-6 py-12 md:max-w-7xl md:flex-row md:justify-between md:items-start">
        
        {/* Esquerda: Logo, Nome, Slogan e Sobre */}
        <div className="flex flex-col gap-4 md:w-1/3 text-left md:text-left">
          <Link href="/" className="flex items-center justify-start space-x-3">
            <img
              src="https://grandtechsistemas.com.br/assets/logo.png"
              alt="Grandtech"
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
            <span className="text-2xl font-bold">Grandtech</span>
          </Link>
          <p className="text-muted-foreground">
            Grandes soluções para grandes desafios.
          </p>
          <p className="text-muted-foreground">
            A Grandtech é uma empresa especializada em desenvolvimento de software personalizado, criando soluções sob medida para atender às necessidades específicas da sua empresa.
          </p>
        </div>

        {/* Meio: Contato e CNPJ */}
        <div className="flex flex-col gap-4 md:w-1/3 text-center md:text-left">
          <div>
            <h4 className="text-lg font-semibold mb-2">Contato</h4>
            <p className="text-muted-foreground">Email: contato@grandtechsistemas.com.br</p>
            <p className="text-muted-foreground">Telefone: +55 (19) 99939-3663</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">CNPJ</h4>
            <p className="text-muted-foreground">
              59.904.503/0001-34
            </p>
          </div>
        </div>

        {/* Direita: Endereço */}
        <div className="flex flex-col gap-4 md:w-1/3 text-center md:text-left">
          <div>
            <h4 className="text-lg font-semibold mb-2">Endereço</h4>
            <p className="text-muted-foreground">
              Av. Maj. Alfredo Camargo Fonseca, 249<br />
              Cidade Nova I, Indaiatuba - SP<br />
              CEP 13334-060
            </p>
          </div>
        </div>

      </div>

      {/* Rodapé inferior: Direitos Reservados */}
      <div className="border-t text-center text-sm py-4 text-muted-foreground">
        © {new Date().getFullYear()} Grandtech. Todos os direitos reservados.
      </div>
    </footer>
  );
}