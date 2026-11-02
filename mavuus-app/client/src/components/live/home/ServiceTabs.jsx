import LiveButton from '../LiveButton'
import NumberedTabs from '../ui/NumberedTabs'
import Reveal from '../ui/Reveal'
import { LEAD } from '../ui/Typography'
import { SERVICE_TABS } from '../../../data/live/home'

const renderPanel = (tab) => (
  <>
    <p className="m-0 text-[25.6px] leading-[1.3] font-medium text-dark-blue max-[767px]:text-[22px]">{tab.title}</p>
    <p className={`${LEAD} m-0`}>{tab.text}</p>
  </>
)

export default function ServiceTabs() {
  return (
    <Reveal className="mt-24 flex flex-col items-center gap-12 max-[991px]:mt-[72px] max-[767px]:mt-14">
      <div className="w-full">
        <NumberedTabs label="Marketing services" scaleStart="Strategy" scaleEnd="Leadership" items={SERVICE_TABS} renderPanel={renderPanel} />
      </div>
      <LiveButton to="/marketing-services" className="whitespace-nowrap">
        Explore Our Marketing Services
      </LiveButton>
    </Reveal>
  )
}
