import React from 'react';
import { AdvantageModal, AdvantageModalProps } from './AdvantageModal';

export type GrantAdvantageModalProps = AdvantageModalProps;

export const GrantAdvantageModal: React.FC<GrantAdvantageModalProps> = (props) => {
  return <AdvantageModal {...props} />;
};

export default GrantAdvantageModal;
