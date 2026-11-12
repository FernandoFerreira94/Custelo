import { TelaDeEstado } from "@/components/feedback/tela-de-estado";

export default function PaginaManutencao() {
  return (
    <TelaDeEstado
      status="info"
      titulo="Estamos melhorando o PacoteZap"
      descricao="Voltamos em poucos minutos. Na portaria, anote no caderno de contingência e registre depois."
      acoes={null}
    />
  );
}
