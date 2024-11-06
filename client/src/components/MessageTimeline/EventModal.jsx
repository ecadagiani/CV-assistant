import PropTypes from 'prop-types';
import OpenIcon from 'src/assets/icons/open.svg?react';
import EventDescription from 'src/components//MessageEvent/EventDescription';
import EventSkillsBubble from 'src/components/MessageEvent/EventSkillsBubble';
import EventSlide from 'src/components/MessageEvent/EventSlide';
import Modal from 'src/components/Modal';

function EventModal({
  isOpen,
  onClose,
  title = '',
  text = '',
  skills = [],
  captures = [],
  capturesOptions = undefined,
  withSkillsDetails = false,
  projectLink = '',
  start = undefined,
  end = undefined,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="large"
      withPanelStyle={false}
      buttons={projectLink && (
        <Modal.Button
          as="a"
          href={projectLink}
          target="_blank"
        >
          <OpenIcon />
        </Modal.Button>
      )}
    >
      <Modal.Card>
        <EventDescription
          title={title}
          text={text}
          skills={skills}
          start={start}
          end={end}
          withSkillsDetails={withSkillsDetails}
          TitleComponent={Modal.Title}
          DescriptionComponent="div"
        />
      </Modal.Card>

      {/* SKILL DETAILS */}
      {withSkillsDetails && (
      <Modal.Card>
        <EventSkillsBubble skills={skills} />
      </Modal.Card>
      )}

      {/* PICTURE SLIDER */}
      <EventSlide
        title={title}
        captures={captures}
        capturesOptions={capturesOptions}
      />
    </Modal>
  );
}

EventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  text: PropTypes.string,
  skills: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    text: PropTypes.string,
    icon: PropTypes.string.isRequired,
    iconOutlined: PropTypes.string,
    usageRatio: PropTypes.number,
    color: PropTypes.string,
  })),
  capturesOptions: PropTypes.object,
  captures: PropTypes.arrayOf(PropTypes.string),
  withSkillsDetails: PropTypes.bool,
  projectLink: PropTypes.string,
  start: PropTypes.instanceOf(Date),
  end: PropTypes.instanceOf(Date),
};

export default EventModal;
