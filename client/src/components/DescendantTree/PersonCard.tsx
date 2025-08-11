import styled from 'styled-components';
import { PositionedNode } from './LayoutManager';

const StyledPersonCard = styled.div<{ $sex?: string }>`
  background: #f0f8ff;
  border: 2px solid #444;
  border-radius: 6px;
  padding: 10px;
  width: 100px;
  height: auto;
  overflow-wrap: break-word;
  background: ${({ $sex }) =>
    $sex === 'male' ? '#e0f0ff' : $sex === 'female' ? '#ffe0e8' : '#f8f8f8'};
`;

interface PersonCardProps {
  person: PositionedNode;
}

export default function PersonCard({ person }: PersonCardProps) {
  return (
    <StyledPersonCard id={person.id} $sex={person.sex}>
      <strong>
        {person.givenName} {person.surname}
      </strong>
      {person.birthDate || person.deathDate ? (
        <div>
          {person.birthDate || '?'} - {person.deathDate || '?'}
        </div>
      ) : (
        ''
      )}
    </StyledPersonCard>
  );
}
