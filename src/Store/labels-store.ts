import type KeyedDB from '@adiwajshing/keyed-db'
import { Chat } from '../Types'
import { Label } from '../Types/Label'

const getLabelKey = (label: Label) => `label_jid_${label.predefinedId}`

export const waLabelKey = () => ({
	key: getLabelKey,
	compare: (k1: string, k2: string) => k2.localeCompare(k1)
})

class LabelsStore {
	labels: KeyedDB<Label, string>

	constructor() {
	  const KeyedDB = require('@adiwajshing/keyed-db').default as new (...args: any[]) => KeyedDB<Label, string>
	  const labelKey = waLabelKey()
		this.labels = new KeyedDB(labelKey, getLabelKey)
	}

	upsert(newLabels: Label[]) {
		this.labels.upsert(...newLabels)
	}

	delete(deletions: string[]) {
		for(const item of deletions) {
			this.labels.deleteById(item)
		}
	}

	deleteById(deletions: string[]) {
		for(const item of deletions) {
			this.labels.deleteById(item)
		}
	}

	getLabels() {
		return this.labels
	}

	getLabelById(id: string) {
		if(!isNaN(Number(id))) {
			id = `label_jid_${id}`
		}

		const label = this.labels.get(id)

		return !!label ? label : null
	}

	addChat({ labelId, chatId }: { labelId: string, chatId: string }) {
		const label = this.getLabelById(labelId)

		if(!label) {
			return
		}

		label.chatIds.add(chatId)
	}

	deleteChat({ labelId, chatId }: { labelId: string, chatId: string }) {
		const label = this.getLabelById(labelId)

		if(!label) {
			return
		}

		label.chatIds.delete(chatId)
	}

	toJSON(chats?: KeyedDB<Chat, string>) {
		const labelsJSON = {}


		for(const label of this.labels.all()) {
			labelsJSON[`label_jid_${label.predefinedId}`] = {
				...label,
				chatIds: [...label.chatIds.values()].filter(id => chats ? !!chats.get(id) : true)
			}
		}

		return labelsJSON
	}

	fromJSON(json: { labels: Label[], chats?: KeyedDB<Chat, string> }) {
		const { chats } = json
		const labelsJSON = Object.values(json.labels || {}).map((labelJSON) => ({
			...labelJSON,
			chatIds: new Set((labelJSON.chatIds as unknown as string[]).filter((id => chats ? !!chats.get(id) : true)))
		}))

		this.labels.upsert(...labelsJSON)
	}
}

const labelsStore = new LabelsStore()

export default labelsStore