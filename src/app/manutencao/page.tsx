import { TelaDeEstado } from "@/components/feedback/tela-de-estado";

export default function PaginaManutencao() {
  return (
    <TelaDeEstado
      status="warning"
      titulo="Estamos em manutenção"
      descricao="Voltamos em alguns minutos. Nada do que você registrou foi perdido."
      acoes={null}
    />
  );
}
