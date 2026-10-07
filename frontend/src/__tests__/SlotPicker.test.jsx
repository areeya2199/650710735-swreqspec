import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import SlotPicker from '../pages/SlotPicker.jsx'

function createMockApi() {
  const calls = []
  return {
    calls,
    getSlots: async (params) => {
      calls.push(params)
      return [
        {
          id: calls.length,
          slot_date: '2569-10-01',
          start_time: '09:00:00',
          remaining: params.packageCode === 'EXECUTIVE' ? 2 : 1,
        },
      ]
    },
  }
}

test('แสดงช่วงเวลาและที่นั่งคงเหลือจาก API จำลอง', async () => {
  const mockApi = createMockApi()

  render(<SlotPicker apiClient={mockApi} />)

  expect(await screen.findByText('09:00 น.')).toBeTruthy()
  expect(screen.getByText('1')).toBeTruthy()
})

test('โหลดช่วงเวลาใหม่เมื่อเปลี่ยนแพ็กเกจ', async () => {
  const mockApi = createMockApi()

  render(<SlotPicker apiClient={mockApi} />)
  await screen.findByText('09:00 น.')

  await act(async () => {
    fireEvent.change(screen.getByLabelText('แพ็กเกจ'), { target: { value: 'PACKAGE-B' } })
  })

  await waitFor(() => expect(mockApi.calls.at(-1).packageCode).toBe('PACKAGE-B'))
  expect(await screen.findByText('1')).toBeTruthy()
})