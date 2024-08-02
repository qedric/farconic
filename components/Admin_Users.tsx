import { useState, useEffect } from 'react'
import { type User } from '@/app/api/mongodb'
import { formatWeiToETH, getBuildingById } from '@/lib/utils'
import { queryProfileNamesFromFids } from '@/app/api/airstack'

// Define the type for the trade details
type TradeDetails = {
  buildingId: string
  mintedQuantity: number
  mintedAmount: string
  burnedQuantity: number
  burnedAmount: string
}

const UsersComponent: React.FC<{ users: User[] }> = ({ users }) => {
  const [sortedUsers, setSortedUsers] = useState(users)
  const [sortConfig, setSortConfig] = useState({ key: 'fid', direction: 'ascending' })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Get the usernames for each fid from airstack
    const fids = sortedUsers.map(user => user.fid.toString())
    queryProfileNamesFromFids(fids)
      .then(users => {
        users.Socials.Social.forEach((user: any) => {
          const matchedUser = sortedUsers.find(sortedUser => sortedUser.fid.toString() === user.userId)
          if (matchedUser) {
            matchedUser.handle = user.profileName
          }
        })
        sortData('fid')
      })
      .catch(err => console.error("Failed to load users."))
  }, [])

  // Sorting function
  const sortData = (key: string) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }

    const sortedArray = [...sortedUsers].sort((a, b) => {
      let aValue: string | number | bigint = 0
      let bValue: string | number | bigint = 0

      if (key === 'buildingsTraded') {
        aValue = a.trades.length
        bValue = b.trades.length
      } else if (key === 'fid') {
        aValue = a[key] as number
        bValue = b[key] as number
      } else if (key === 'handle') {
        aValue = a[key] as string
        bValue = b[key] as string
      } else if (key === 'numberMinted') {
        aValue = a.trades.reduce((sum, trade) => sum + (trade.minted?.quantity || 0), 0)
        bValue = b.trades.reduce((sum, trade) => sum + (trade.minted?.quantity || 0), 0)
      } else if (key === 'mintedAmount') {
        aValue = BigInt(a.trades.reduce((sum, trade) => sum + (Number.isNaN(Number(trade.minted?.totalAmount)) ? 0 : Number(trade.minted?.totalAmount)), 0))
        bValue = BigInt(b.trades.reduce((sum, trade) => sum + (Number.isNaN(Number(trade.minted?.totalAmount)) ? 0 : Number(trade.minted?.totalAmount)), 0))
      } else if (key === 'numberBurned') {
        aValue = a.trades.reduce((sum, trade) => sum + (trade.minted?.quantity || 0), 0)
        bValue = b.trades.reduce((sum, trade) => sum + (trade.minted?.quantity || 0), 0)
      } else if (key === 'burnedAmount') {
        aValue = BigInt(a.trades.reduce((sum, trade) => sum + (Number.isNaN(Number(trade.burned?.totalAmount)) ? 0 : Number(trade.burned?.totalAmount)), 0))
        bValue = BigInt(b.trades.reduce((sum, trade) => sum + (Number.isNaN(Number(trade.burned?.totalAmount)) ? 0 : Number(trade.burned?.totalAmount)), 0))
      }

      if (!aValue) aValue = 0
      if (!bValue) bValue = 0

      if (aValue < bValue) {
        return direction === 'ascending' ? -1 : 1
      }
      if (aValue > bValue) {
        return direction === 'ascending' ? 1 : -1
      }
      return 0
    })

    setSortedUsers(sortedArray)
    setSortConfig({ key, direction })
  }

  // Helper to format trade details
  const getTradeDetails = (user: User): TradeDetails[] => user.trades.map(trade => ({
    buildingId: trade.buildingId,
    mintedQuantity: (trade.minted?.quantity || 0),
    mintedAmount: formatWeiToETH(BigInt(Number.isNaN(Number(trade.minted?.totalAmount)) ? 0 : Number(trade.minted?.totalAmount)), false),
    burnedQuantity: (trade.burned?.quantity || 0),
    burnedAmount: formatWeiToETH(BigInt(Number.isNaN(Number(trade.burned?.totalAmount)) ? 0 : Number(trade.burned?.totalAmount)), false),
  }))

  // Handle row click to open modal
  const handleRowClick = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  // Helper function to get sort indicator
  const getSortIndicator = (key: string) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '▲' : '▼'
    }
    return ''
  }

  return (
    <div className="w-full flex justify-center flex-wrap lg:flex-row items-center mt-4 gap-x-2 lg:gap-x-8 gap-y-4 my-12">
      <h1 className="w-full text-center mb-4">Users:</h1>
      <div className="w-full grid grid-cols-7 gap-4 text-center font-bold">
        <div onClick={() => sortData('fid')} className="w-fit mx-auto relative cursor-pointer">
          FID<span className="absolute -right-5">{getSortIndicator('fid')}</span>
        </div>
        <div onClick={() => sortData('handle')} className="w-fit mx-auto relative cursor-pointer">
          handle<span className="absolute -right-5">{getSortIndicator('handle')}</span>
        </div>
        <div onClick={() => sortData('buildingsTraded')} className="w-fit mx-auto relative cursor-pointer">
          Buildings Traded<span className="absolute -right-5">{getSortIndicator('buildingsTraded')}</span>
        </div>
        <div onClick={() => sortData('numberMinted')} className="w-fit mx-auto relative cursor-pointer">
          Minted<span className="absolute -right-5">{getSortIndicator('numberMinted')}</span>
        </div>
        <div onClick={() => sortData('mintedAmount')} className="w-fit mx-auto relative cursor-pointer">
          Minted Amount (ETH)<span className="absolute -right-5">{getSortIndicator('mintedAmount')}</span>
        </div>
        <div onClick={() => sortData('numberBurned')} className="w-fit mx-auto relative cursor-pointer">
          Burned<span className="absolute -right-5">{getSortIndicator('numberBurned')}</span>
        </div>
        <div onClick={() => sortData('burnedAmount')} className="w-fit mx-auto relative cursor-pointer">
          Burned Amount (ETH)<span className="absolute -right-5">{getSortIndicator('burnedAmount')}</span>
        </div>
      </div>
      {sortedUsers.map(user => {
        const numberMinted = user.trades.reduce((sum, trade) => sum + (trade.minted?.quantity || 0), 0)
        const mintedAmount = BigInt(user.trades.reduce((sum, trade) => sum + (Number.isNaN(Number(trade.minted?.totalAmount)) ? 0 : Number(trade.minted?.totalAmount)), 0))
        const numberBurned = user.trades.reduce((sum, trade) => sum + (trade.burned?.quantity || 0), 0)
        const burnedAmount = BigInt(user.trades.reduce((sum, trade) => sum + (Number.isNaN(Number(trade.burned?.totalAmount)) ? 0 : Number(trade.burned?.totalAmount)), 0))

        return (
          <div
            key={user.fid}
            className="w-full grid grid-cols-7 gap-4 text-center cursor-pointer hover:bg-gray-100"
            onClick={() => handleRowClick(user)}
          >
            <div>{user.fid}</div>
            <div>{user.handle}</div>
            <div>{user.trades.length}</div>
            <div>{numberMinted}</div>
            <div>{formatWeiToETH(mintedAmount, false)}</div>
            <div>{numberBurned}</div>
            <div>{formatWeiToETH(burnedAmount, false)}</div>
          </div>
        )
      })}

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl relative">
            <h2 className="text-xl font-bold mb-4">Trade Details for {selectedUser.handle} - {selectedUser.fid}</h2>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={handleCloseModal}
            >
              &times;
            </button>
            <div className="grid grid-cols-5 gap-4 text-center font-bold mb-4">
              <div>Building Name</div>
              <div>Minted</div>
              <div>Minted Amount (ETH)</div>
              <div>Burned</div>
              <div>Burned Amount (ETH)</div>
            </div>
            {getTradeDetails(selectedUser).map((trade, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 text-center py-1 even:bg-gray-200">
                <div>{getBuildingById(trade.buildingId)?.metadata.name}</div>
                <div>{trade.mintedQuantity}</div>
                <div>{trade.mintedAmount}</div>
                <div>{trade.burnedQuantity}</div>
                <div>{trade.burnedAmount}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersComponent