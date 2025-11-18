'use client';

import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t bg-background text-foreground">
      <div className="mx-auto flex flex-col gap-10 px-6 py-12 md:max-w-7xl md:flex-row md:justify-between md:items-start">
        
        {/* Esquerda: Logo, Nome, Slogan e Sobre */}
        <div className="flex flex-col gap-4 md:w-1/2 text-left md:text-left">
          <Link href="/" className="flex items-center justify-start space-x-3">
            <img
              src="/assets/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
            <span className="text-2xl font-bold">MGR Refrigeração</span>
          </Link>
          <p className="text-muted-foreground">
            Engenharia de Frio que Gera Solução.
          </p>
          <p className="text-muted-foreground">
            Na indústria, refrigeração parada é prejuízo na certa. Nós garantimos que sua operação funcione, protegendo seu produto e sua lucratividade. Deixe o frio conosco e foque em produzir.
          </p>
        </div>

        {/* Meio: Contato e CNPJ */}
        <div className="flex flex-col gap-4 md:w-1/3 text-center md:text-left">
          <div>
            <h4 className="text-lg font-semibold mb-2">Contato</h4>
            <p className="text-muted-foreground">Email: contato@mgrrefrigeracao.com.br</p>
            <p className="text-muted-foreground">Telefone: +55 (19) 97138-2628</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">CNPJ</h4>
            <p className="text-muted-foreground">
              15.277.616/0001-81
            </p>
          </div>
        </div>

        {/* Direita: Endereço */}
        {/* <div className="flex flex-col gap-4 md:w-1/3 text-center md:text-left">
          <div>
            <h4 className="text-lg font-semibold mb-2">Endereço</h4>
            <p className="text-muted-foreground">
              Av. Maj. Alfredo Camargo Fonseca, 249<br />
              Cidade Nova I, Indaiatuba - SP<br />
              CEP 13334-060
            </p>
          </div>
        </div> */}

      </div>

      {/* Rodapé inferior: Direitos Reservados */}
      <div className="flex flex-col border-t text-center text-sm py-4 text-muted-foreground">
        © {new Date().getFullYear()} MGR Refrigeração. Todos os direitos reservados.
        <span>
          Desenvolvido por{" "}
          <a
              href="https://grandtechsistemas.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary text-primary"
          >
              Grandtech Sistemas
          </a>
        </span>
      </div>
    </footer>
  );
}